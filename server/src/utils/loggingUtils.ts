// src/utils/loggingUtils.ts

// --- Constants ---
const REDACTED_PLACEHOLDER = '[REDACTED]';

// Default fields to redact from bodies and headers
const defaultSensitiveFields = new Set([
    'password', 'token', 'secret', 'authorization', 'cookie',
    'sessionid', 'connect.sid', 'accesstoken', 'refreshtoken',
    'clientsecret', 'client_secret', 'apikey', 'api_key',
    'x-api-key', 'x-admin-key'
]);

// Key headers to specifically log (lowercase)
const keyHeadersToLog = new Set([
    'host',
    'user-agent',
    'accept',
    'content-type',
    'content-length',
    'authorization', // Will be redacted
    'referer',
    'x-forwarded-for',
    'x-request-id', // If using a proxy that sets it
    'cache-control'
]);

// --- Configuration ---
let sensitiveFields = defaultSensitiveFields;

export function configureSensitiveFields(additionalFieldsEnvVar?: string): void {
    if (additionalFieldsEnvVar) {
        const additional = additionalFieldsEnvVar.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
        sensitiveFields = new Set([...defaultSensitiveFields, ...additional]);
        console.log('Configured Sensitive Fields:', Array.from(sensitiveFields));
    } else {
        console.log('Using Default Sensitive Fields:', Array.from(sensitiveFields));
    }
}

// --- Redaction Logic ---

function redactValue(key: string | number, value: any): any {
    const lowerKey = typeof key === 'string' ? key.toLowerCase() : '';

    if (typeof key === 'string' && sensitiveFields.has(lowerKey)) {
        return REDACTED_PLACEHOLDER;
    }
    if (lowerKey === 'authorization' && typeof value === 'string' && value.toLowerCase().startsWith('bearer ')) {
        return 'Bearer [REDACTED]';
    }
    if (lowerKey === 'cookie' && typeof value === 'string') {
        let redactedCookie = value;
        sensitiveFields.forEach(fieldName => {
            const regex = new RegExp(`(${ fieldName }=)([^;]+)`, 'gi');
            redactedCookie = redactedCookie.replace(regex, `$1${ REDACTED_PLACEHOLDER }`);
        });
        return redactedCookie;
    }
    if (value !== null && typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.map((item, index) => redactValue(index, item));
        } else {
            const redactedObject: { [key: string]: any } = {};
            for (const subKey in value) {
                if (Object.prototype.hasOwnProperty.call(value, subKey)) {
                    redactedObject[subKey] = redactValue(subKey, value[subKey]);
                }
            }
            return redactedObject;
        }
    }
    return value;
}

export function createRedactedCopy(data: any): any {
    if (!data || typeof data !== 'object') return data;
    return redactValue('root', { ...data }).root; // Clone first
}

export function selectAndRedactHeaders(headers: Record<string, any>): Record<string, any> {
    const selectedHeaders: Record<string, any> = {};
    for (const headerName in headers) {
        const lowerHeaderName = headerName.toLowerCase();
        if (keyHeadersToLog.has(lowerHeaderName)) {
            selectedHeaders[headerName] = redactValue(lowerHeaderName, headers[headerName]);
        }
    }
    return selectedHeaders;
}


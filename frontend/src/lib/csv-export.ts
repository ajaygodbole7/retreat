// src/lib/csv-export.ts

/**
 * Options for CSV conversion and export
 */
export interface CSVConversionOptions<T> {
    // Headers for the CSV file
    headers: string[];

    // Function to map each item to a row of values
    mapItemToRow: (item: T) => (string | number | boolean | null | undefined)[];

    // Optional filename prefix (default is 'export')
    filenamePrefix?: string;
}

/**
 * Converts an array of items to a CSV string
 * @param items Array of data items to convert
 * @param options Configuration options for conversion
 * @returns CSV formatted string
 */
export function convertToCSV<T>(
    items: T[],
    options: CSVConversionOptions<T>
): string {
    if (!items || items.length === 0) {
        return 'No data available';
    }

    // Create the CSV header row
    let csvContent = options.headers.join(',') + '\r\n';

    // Process each item
    items.forEach(item => {
        // Get the row data from the mapping function
        const rowData = options.mapItemToRow(item);

        // Escape each value and join with commas
        const row = rowData.map(escapeCsvValue);

        // Add the row to CSV content
        csvContent += row.join(',') + '\r\n';
    });

    return csvContent;
}

/**
 * Escapes a value for CSV format
 * @param value The value to escape
 * @returns Escaped string value
 */
function escapeCsvValue(value: any): string {
    if (value == null) return '';
    const stringValue = String(value);

    // If the value contains quotes, commas, or newlines, wrap in quotes and escape existing quotes
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
}

/**
 * Generates a filename for the CSV export
 * @param prefix Prefix for the filename
 * @returns Formatted filename with date
 */
export function generateCsvFilename(prefix: string = 'export'): string {
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return `${prefix}-${date}.csv`;
}

/**
 * Downloads data as a CSV file
 * @param items Array of data items to export
 * @param options Configuration options for conversion
 * @param onExportStart Optional callback when export starts
 * @param onExportComplete Optional callback when export completes
 * @param onExportError Optional callback when export fails
 */
export async function downloadCSV<T>(
    items: T[],
    options: CSVConversionOptions<T>,
    onExportStart?: () => void,
    onExportComplete?: () => void,
    onExportError?: (error: any) => void
): Promise<void> {
    try {
        // Notify export started
        if (onExportStart) onExportStart();

        // Generate CSV content
        const csvContent = convertToCSV(items, options);

        // Create Blob with CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create URL for download
        const url = URL.createObjectURL(blob);

        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;

        // Generate filename
        link.download = generateCsvFilename(options.filenamePrefix);

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Notify export completed
        if (onExportComplete) onExportComplete();
    } catch (error) {
        console.error('Error exporting CSV:', error);
        // Notify error
        if (onExportError) onExportError(error);
    }
}
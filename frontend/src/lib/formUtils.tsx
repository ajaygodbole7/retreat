// src/lib/formUtils.tsx
import React from "react";
import { z } from "zod";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

// Helper component for required fields
export const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center space-x-1">
        <span>{children}</span>
        <span className="text-destructive">*</span>
    </div>
);

// Types for field components
export type FieldProps = {
    field: any;
    label: string;
    description?: string;
    required?: boolean;
}

export type TextFieldProps = FieldProps & {
    placeholder?: string;
}

export type TextareaFieldProps = FieldProps & {
    className?: string;
}

export type NumberFieldProps = FieldProps & {
    step?: string;
    min?: string;
    max?: string;
}

export type CheckboxFieldProps = FieldProps & {
    inline?: boolean;
}

export type SelectOption = {
    value: string;
    label: string;
}

export type SelectFieldProps = FieldProps & {
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    allowEmpty?: boolean;
    emptyLabel?: string;
    emptyValue?: string;
    loading?: boolean;
}

// Text Input Field
export const TextField = ({
    field,
    label,
    description,
    required,
    placeholder,
}: TextFieldProps) => (
    <FormItem>
        <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
        </FormLabel>
        <FormControl>
            <Input
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder={placeholder}
            />
        </FormControl>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage className="text-xs">{field.error}</FormMessage>
    </FormItem>
);

// Textarea Field
export const TextareaField = ({
    field,
    label,
    description,
    required,
    className = "h-20 resize-none",
}: TextareaFieldProps) => (
    <FormItem>
        <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
        </FormLabel>
        <FormControl>
            <Textarea
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                className={className}
            />
        </FormControl>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage className="text-xs">{field.error}</FormMessage>
    </FormItem>
);

// Number Input Field
export const NumberField = ({
    field,
    label,
    description,
    required,
    step = "1",
    min,
    max,
}: NumberFieldProps) => (
    <FormItem>
        <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
        </FormLabel>
        <FormControl>
            <Input
                type="number"
                step={step}
                min={min}
                max={max}
                value={field.value ?? ""}
                onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    field.onChange(value);
                }}
                onBlur={field.onBlur}
            />
        </FormControl>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage className="text-xs">{field.error}</FormMessage>
    </FormItem>
);

// Checkbox Field
export const CheckboxField = ({
    field,
    label,
    description,
    inline = true,
}: CheckboxFieldProps) => (
    <FormItem className={inline ? "flex items-center space-x-2" : ""}>
        <FormControl>
            <Checkbox
                checked={field.value || false}
                onCheckedChange={(checked) => field.onChange(!!checked)}
                onBlur={field.onBlur}
            />
        </FormControl>
        <div>
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription className="text-xs">{description}</FormDescription>}
        </div>
        <FormMessage className="text-xs">{field.error}</FormMessage>
    </FormItem>
);

// Select Field
export const SelectField = ({
    field,
    label,
    description,
    required,
    options,
    placeholder = "Select...",
    disabled = false,
    allowEmpty = false,
    emptyLabel = "None",
    emptyValue = "none",
    loading = false,
}: SelectFieldProps) => (
    <FormItem>
        <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
        </FormLabel>
        <Select
            value={field.value?.toString() || (allowEmpty ? emptyValue : undefined)}
            onValueChange={(value) => {
                if (allowEmpty && value === emptyValue) {
                    field.onChange(null);
                } else {
                    field.onChange(Number(value));
                }
            }}
            disabled={disabled || loading}
        >
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {loading ? (
                    <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                ) : (
                    <>
                        {allowEmpty && <SelectItem value={emptyValue}>{emptyLabel}</SelectItem>}
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </>
                )}
            </SelectContent>
        </Select>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage className="text-xs">{field.error}</FormMessage>
    </FormItem>
);

// Error Alert Component
export const FormErrorAlert = ({ error }: { error: string | null }) => {
    if (!error) return null;

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
};

// Helper for section errors
export const getSectionErrors = (errors: Record<string, any>, fieldGroups: Record<string, string[]>) => {
    const result: Record<string, boolean> = {};

    Object.entries(fieldGroups).forEach(([section, fields]) => {
        result[section] = fields.some(field => errors[field]);
    });

    return result;
};
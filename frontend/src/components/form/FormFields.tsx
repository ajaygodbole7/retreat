// src/components/form/FormFields.tsx
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"

// Text Input Field
export function TextField({
    form,
    name,
    label,
    description,
    placeholder,
    validators,
}: {
    form: any
    name: string
    label: string
    description?: string
    placeholder?: string
    validators?: any
}) {
    return (
        <form.Field
            name={name}
            validators={validators}
        >
            {(field) => (
                <div className="space-y-2">
                    <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                    <Input
                        id={name}
                        placeholder={placeholder}
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    {field.state.meta.touchedErrors ? (
                        <p className="text-sm font-medium text-destructive">{field.state.meta.touchedErrors}</p>
                    ) : null}
                </div>
            )}
        </form.Field>
    )
}

// Textarea Field
export function TextareaField({
    form,
    name,
    label,
    description,
    placeholder,
    className,
}: {
    form: any
    name: string
    label: string
    description?: string
    placeholder?: string
    className?: string
}) {
    return (
        <form.Field
            name={name}
        >
            {(field) => (
                <div className={`space-y-2 ${className || ""}`}>
                    <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                    <Textarea
                        id={name}
                        placeholder={placeholder}
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    {field.state.meta.touchedErrors ? (
                        <p className="text-sm font-medium text-destructive">{field.state.meta.touchedErrors}</p>
                    ) : null}
                </div>
            )}
        </form.Field>
    )
}

// Number Input Field
export function NumberField({
    form,
    name,
    label,
    description,
    placeholder,
    step,
    validators,
}: {
    form: any
    name: string
    label: string
    description?: string
    placeholder?: string
    step?: string
    validators?: any
}) {
    return (
        <form.Field
            name={name}
            validators={validators}
        >
            {(field) => (
                <div className="space-y-2">
                    <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                    <Input
                        id={name}
                        type="number"
                        step={step}
                        placeholder={placeholder}
                        value={field.state.value || ""}
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : undefined;
                            field.handleChange(value);
                        }}
                        onBlur={field.handleBlur}
                    />
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    {field.state.meta.touchedErrors ? (
                        <p className="text-sm font-medium text-destructive">{field.state.meta.touchedErrors}</p>
                    ) : null}
                </div>
            )}
        </form.Field>
    )
}

// Checkbox Field
export function CheckboxField({
    form,
    name,
    label,
    description,
}: {
    form: any
    name: string
    label: string
    description?: string
}) {
    return (
        <form.Field
            name={name}
        >
            {(field) => (
                <div className="flex flex-row items-start space-x-3 space-y-0">
                    <div className="flex items-center h-4 mt-1">
                        <Checkbox
                            id={name}
                            checked={field.state.value || false}
                            onCheckedChange={(checked) => field.handleChange(checked)}
                            onBlur={field.handleBlur}
                        />
                    </div>
                    <div className="space-y-1 leading-none">
                        <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {label}
                        </label>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    {field.state.meta.touchedErrors ? (
                        <p className="text-sm font-medium text-destructive">{field.state.meta.touchedErrors}</p>
                    ) : null}
                </div>
            )}
        </form.Field>
    )
}

// Select Field
export function SelectField({
    form,
    name,
    label,
    description,
    placeholder,
    options,
    isLoading,
    disabled,
    validators,
}: {
    form: any
    name: string
    label: string
    description?: string
    placeholder?: string
    options: { value: string | number; label: string }[]
    isLoading?: boolean
    disabled?: boolean
    validators?: any
}) {
    return (
        <form.Field
            name={name}
            validators={validators}
        >
            {(field) => (
                <div className="space-y-2">
                    <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                    <select
                        id={name}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.state.value || ""}
                        onChange={(e) => {
                            const value = e.target.value ?
                                (typeof options[0]?.value === 'number' ? Number(e.target.value) : e.target.value)
                                : undefined;
                            field.handleChange(value);
                        }}
                        onBlur={field.handleBlur}
                        disabled={disabled || isLoading}
                    >
                        <option value="">{placeholder || "Select an option"}</option>
                        {isLoading ? (
                            <option disabled>Loading...</option>
                        ) : (
                            options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))
                        )}
                    </select>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    {field.state.meta.touchedErrors ? (
                        <p className="text-sm font-medium text-destructive">{field.state.meta.touchedErrors}</p>
                    ) : null}
                </div>
            )}
        </form.Field>
    )
}
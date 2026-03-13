"use client";

import { Input } from "../primitives/Input";
import { Select } from "../primitives/Select";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Convenience wrapper for input fields
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function InputField({
  label,
  error,
  hint,
  required,
  leftIcon,
  rightIcon,
  ...inputProps
}: InputFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Input error={!!error} leftIcon={leftIcon} rightIcon={rightIcon} {...inputProps} />
    </FormField>
  );
}

// Convenience wrapper for select fields
interface SelectFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  name?: string;
}

export function SelectField({
  label,
  error,
  hint,
  required,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Select error={!!error} options={options} placeholder={placeholder} {...selectProps} />
    </FormField>
  );
}

// Textarea field
interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function TextareaField({
  label,
  error,
  hint,
  required,
  className = "",
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <textarea
        className={`
          w-full px-3 py-2 text-sm bg-muted-bg border rounded-lg resize-none
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-error focus:border-error focus:ring-error/20" : "border-border"}
          ${className}
        `}
        {...textareaProps}
      />
    </FormField>
  );
}

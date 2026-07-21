import { forwardRef, type ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: FieldError;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, children }, ref) => {
    return (
      <div ref={ref}>
        <label className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark">
          {label}
          {required && <span className="text-spark-primary ml-1">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        {hint && !error && (
          <p className="mt-1 text-sm dark:text-spark-dark-text text-spark-gray">{hint}</p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

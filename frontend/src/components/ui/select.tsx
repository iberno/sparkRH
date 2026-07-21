import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div>
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`py-2.5 px-4 block w-full border rounded-lg text-sm transition-colors focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark ${
            error
              ? 'dark:border-red-500/50 border-red-500'
              : 'dark:border-spark-dark-border border-gray-200'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-spark-gray dark:text-spark-dark-text">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

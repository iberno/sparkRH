import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`py-2.5 px-4 block w-full border rounded-lg text-sm transition-colors focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark ${
            error
              ? 'dark:border-red-500/50 border-red-500'
              : 'dark:border-spark-dark-border border-gray-200'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-spark-gray dark:text-spark-dark-text">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

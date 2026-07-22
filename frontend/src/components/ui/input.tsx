import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const BASE_CLASSES =
  'py-2.5 px-4 block w-full border rounded-lg text-sm transition-colors ' +
  'focus:border-spark-primary focus:ring-2 focus:ring-spark-primary focus:outline-none ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'dark:bg-spark-dark-bg dark:text-spark-dark-text dark:border-spark-dark-border ' +
  'bg-gray-50 text-spark-dark border-gray-200';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', id, ...props }, ref) => {
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
        <div className="relative">
          {icon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${BASE_CLASSES} ${icon ? 'ps-10' : ''} ${
              error
                ? 'dark:border-red-500/50 border-red-500'
                : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-spark-gray dark:text-spark-dark-text">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

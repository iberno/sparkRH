import { forwardRef, type HTMLAttributes } from 'react';

interface ToggleProps extends Omit<HTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked?: boolean;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, checked, className = '', ...props }, ref) => {
    return (
      <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-spark-primary rounded-full peer dark:bg-spark-dark-border peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-spark-dark-border peer-checked:bg-spark-primary" />
        {label && <span className="ms-2 text-sm dark:text-spark-dark-text text-spark-dark">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = 'Toggle';

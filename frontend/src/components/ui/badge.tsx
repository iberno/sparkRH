import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300',
  primary: 'bg-spark-primary/10 text-spark-primary',
  success: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400',
};

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

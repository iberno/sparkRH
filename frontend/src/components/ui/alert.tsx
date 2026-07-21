import type { HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const variantConfig = {
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400',
    iconClass: 'text-red-600 dark:text-red-400',
  },
};

export function Alert({ variant = 'info', className = '', children, ...props }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${config.classes} ${className}`}
      {...props}
    >
      <Icon className={`size-4 shrink-0 ${config.iconClass}`} />
      <span className="text-sm">{children}</span>
    </div>
  );
}

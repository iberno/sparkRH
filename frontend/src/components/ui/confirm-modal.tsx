import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    confirmBtn: 'bg-spark-primary hover:bg-spark-primary-hover text-white',
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-spark-dark-surface rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border dark:border-spark-dark-border border-gray-200">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <Icon className={`size-5 ${config.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold dark:text-white text-spark-dark font-heading">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-spark-gray dark:text-spark-dark-text hover:bg-gray-100 dark:hover:bg-spark-dark-bg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm dark:text-spark-dark-text text-spark-gray leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t dark:border-spark-dark-border border-gray-100">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={config.confirmBtn}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

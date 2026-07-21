import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="size-12 flex items-center justify-center rounded-full dark:bg-spark-dark-surface bg-gray-100 mb-4">
        <Icon className="size-6 dark:text-spark-dark-text text-spark-gray" />
      </div>
      <h3 className="text-lg font-medium dark:text-white text-spark-dark mb-1">{title}</h3>
      {description && (
        <p className="text-sm dark:text-spark-dark-text text-spark-gray text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

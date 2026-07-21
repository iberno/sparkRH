import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, iconColor = 'text-spark-primary', subtitle }: KPICardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-x-4">
        <div className={`size-10 flex justify-center items-center rounded-lg ${iconColor}/10`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs uppercase dark:text-spark-dark-text text-spark-gray">{title}</p>
          <h3 className="text-xl font-bold dark:text-white text-spark-dark font-heading">{value}</h3>
          {subtitle && (
            <p className="text-xs dark:text-spark-dark-text text-spark-gray">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

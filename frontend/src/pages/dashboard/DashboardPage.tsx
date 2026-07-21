import { Users, Building2, FileText, DollarSign } from 'lucide-react';
import { PageHeader, KPICard } from '../../components/custom';
import { Card, CardContent } from '../../components/ui';

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do sistema"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Colaboradores" value={0} icon={Users} iconColor="text-spark-primary" />
        <KPICard title="Postos Ativos" value={0} icon={Building2} iconColor="text-teal-500" />
        <KPICard title="Contratos" value={0} icon={FileText} iconColor="text-yellow-500" />
        <KPICard title="Folha do Mês" value="R$ 0" icon={DollarSign} iconColor="text-purple-500" />
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold dark:text-white text-spark-dark mb-4 font-heading">
            Bem-vindo ao Spark RH & DP Portal
          </h2>
          <p className="dark:text-spark-dark-text text-spark-gray">
            Use o menu lateral para navegar entre os módulos do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

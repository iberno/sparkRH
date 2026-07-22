import { useState, useEffect } from 'react';
import { Users, GraduationCap, HeartPulse, AlertTriangle, Car, Bike, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, KPICard } from '../../components/custom';
import { Card, CardContent, Badge, Spinner } from '../../components/ui';

interface DashboardKpis {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalTrainings: number;
  expiredTrainings: number;
  expiringTrainings: number;
  totalAsos: number;
  expiredAsos: number;
  inaptAsos: number;
  expiringAsos: number;
  totalOccurrences: number;
  openOccurrences: number;
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  expiringCnh: number;
}

interface ExpiringItem {
  id: string;
  name?: string;
  type?: string;
  expiry_date?: string;
  cnh_expiry?: string;
  status?: string;
  result?: string;
  employee: { full_name: string; cpf: string; registration_number: string; };
}

interface DashboardData {
  kpis: DashboardKpis;
  alerts: {
    expiringTrainings: ExpiringItem[];
    expiringAsos: ExpiringItem[];
    expiringCnh: ExpiringItem[];
  };
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<DashboardData>('/dashboard/overview');
      setData(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Visão geral do sistema" />
        <Card>
          <CardContent>
            <p className="dark:text-spark-dark-text text-spark-gray text-center py-8">
              Erro ao carregar dados do dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kpis, alerts } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Colaboradores Ativos" value={kpis.activeEmployees} icon={Users} iconColor="text-spark-primary" />
        <KPICard title="Treinamentos Vencidos" value={kpis.expiredTrainings} icon={GraduationCap} iconColor="text-yellow-500" />
        <KPICard title="ASOs Vencidos" value={kpis.expiredAsos} icon={HeartPulse} iconColor="text-orange-500" />
        <KPICard title="Ocorrências Abertas" value={kpis.openOccurrences} icon={AlertTriangle} iconColor="text-red-500" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Colaboradores" value={kpis.totalEmployees} icon={Users} iconColor="text-blue-500" />
        <KPICard title="Veículos Ativos" value={kpis.activeVehicles} icon={Car} iconColor="text-teal-500" />
        <KPICard title="Motoristas" value={kpis.totalDrivers} icon={Bike} iconColor="text-purple-500" />
        <KPICard title="ASOs INAPTO" value={kpis.inaptAsos} icon={XCircle} iconColor="text-red-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold dark:text-white text-spark-dark mb-4 font-heading flex items-center gap-2">
              <GraduationCap className="size-5 text-yellow-500" />
              Treinamentos Vencendo (30 dias)
            </h2>
            {alerts.expiringTrainings.length === 0 ? (
              <p className="dark:text-spark-dark-text text-spark-gray text-sm">Nenhum treinamento vencendo.</p>
            ) : (
              <div className="space-y-3">
                {alerts.expiringTrainings.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg dark:bg-spark-dark-surface bg-gray-50">
                    <div>
                      <p className="font-medium dark:text-white text-spark-dark text-sm">{t.name}</p>
                      <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                        {t.employee.full_name} — {t.employee.registration_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning">
                        <Clock className="size-3 mr-1" />
                        {t.expiry_date ? new Date(t.expiry_date).toLocaleDateString('pt-BR') : '-'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold dark:text-white text-spark-dark mb-4 font-heading flex items-center gap-2">
              <HeartPulse className="size-5 text-orange-500" />
              ASOs Vencendo (30 dias)
            </h2>
            {alerts.expiringAsos.length === 0 ? (
              <p className="dark:text-spark-dark-text text-spark-gray text-sm">Nenhum ASO vencendo.</p>
            ) : (
              <div className="space-y-3">
                {alerts.expiringAsos.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg dark:bg-spark-dark-surface bg-gray-50">
                    <div>
                      <p className="font-medium dark:text-white text-spark-dark text-sm">
                        {a.type} — {a.result === 'APTO' ? 'APTO' : 'INAPTO'}
                      </p>
                      <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                        {a.employee.full_name} — {a.employee.registration_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={a.result === 'APTO' ? 'warning' : 'danger'}>
                        <Clock className="size-3 mr-1" />
                        {a.expiry_date ? new Date(a.expiry_date).toLocaleDateString('pt-BR') : '-'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold dark:text-white text-spark-dark mb-4 font-heading flex items-center gap-2">
            <Bike className="size-5 text-purple-500" />
            CNH Vencendo (60 dias)
          </h2>
          {alerts.expiringCnh.length === 0 ? (
            <p className="dark:text-spark-dark-text text-spark-gray text-sm">Nenhuma CNH vencendo.</p>
          ) : (
            <div className="space-y-3">
              {alerts.expiringCnh.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg dark:bg-spark-dark-surface bg-gray-50">
                  <div>
                    <p className="font-medium dark:text-white text-spark-dark text-sm">{d.employee.full_name}</p>
                    <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                      {d.employee.registration_number} — CNH: {d.cnh_expiry ? new Date(d.cnh_expiry).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <Badge variant="warning">
                    <Clock className="size-3 mr-1" />
                    Vencendo
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FileText, Search, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface TimeSheet {
  id: string;
  period_start: string;
  period_end: string;
  total_worked_hours: number;
  total_overtime_hours: number;
  total_night_hours: number;
  total_absence_days: number;
  overtime_value: number;
  night_add_value: number;
  status: string;
  calculated_at: string | null;
  approved_at: string | null;
  employee: { id: string; full_name: string; registration_number: string };
  approver: { id: string; full_name: string } | null;
}

interface TimeSheetsResponse {
  data: TimeSheet[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  CALCULADO: 'Calculado',
  APROVADO: 'Aprovado',
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  PENDENTE: 'default',
  CALCULADO: 'info',
  APROVADO: 'success',
};

export function TimeSheetsListPage() {
  const [sheets, setSheets] = useState<TimeSheet[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchSheets(); }, [page, search, statusFilter]);

  const fetchSheets = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<TimeSheetsResponse>(`/time-sheets?${params.toString()}`);
      setSheets(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar espelhos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/time-sheets/${id}/approve`);
      toast.success('Espelho aprovado!');
      fetchSheets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao aprovar');
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Espelho de Ponto"
        subtitle="Visualização consolidada de marcações"
      />

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 dark:text-spark-dark-text text-spark-gray" />
                <Input
                  placeholder="Buscar por colaborador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todos os status' },
                  ...Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : sheets.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum espelho encontrado"
              description="Calcule o espelho de ponto para os colaboradores."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Período</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Horas Trab.</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">HE</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ad. Noturno</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Faltas</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Valor HE</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.map((s) => (
                      <tr key={s.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <p className="font-medium dark:text-white text-spark-dark">{s.employee?.full_name}</p>
                          <p className="text-xs dark:text-spark-dark-text text-spark-gray">{s.employee?.registration_number}</p>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(s.period_start)} - {formatDate(s.period_end)}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono">{s.total_worked_hours}h</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono">{s.total_overtime_hours}h</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono">{s.total_night_hours}h</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right">{s.total_absence_days}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono text-xs">{formatCurrency(s.overtime_value)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={STATUS_VARIANTS[s.status] || 'default'}>
                            {STATUS_LABELS[s.status] || s.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {s.status === 'CALCULADO' && (
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(s.id)} className="text-green-500 hover:text-green-600">
                                <Check className="size-4 mr-1" />
                                Aprovar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

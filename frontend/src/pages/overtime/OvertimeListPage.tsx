import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HandCoins, Plus, Search, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface OvertimeRequest {
  id: string;
  request_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  overtime_type: string;
  reason: string | null;
  status: string;
  review_note: string | null;
  employee: { id: string; full_name: string; registration_number: string };
  post: { id: string; name: string; code: string };
  reviewer: { id: string; full_name: string } | null;
}

interface OvertimeResponse {
  data: OvertimeRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PENDENTE: 'warning',
  APROVADO: 'success',
  REJEITADO: 'danger',
};

const TYPE_LABELS: Record<string, string> = {
  HE50: 'HE 50%',
  HE100: 'HE 100%',
  ADICIONAL_NOTURNO: 'Adicional Noturno',
};

export function OvertimeListPage() {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchRequests(); }, [page, search, statusFilter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<OvertimeResponse>(`/overtime?${params.toString()}`);
      setRequests(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar solicitações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APROVADO' | 'REJEITADO') => {
    try {
      await api.put(`/overtime/${id}/review`, { status });
      toast.success(status === 'APROVADO' ? 'Solicitação aprovada!' : 'Solicitação rejeitada!');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao avaliar');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Horas Extras"
        subtitle="Solicitações e aprovação de horas extras"
        actions={
          <Link to="/overtime/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Nova Solicitação
            </Button>
          </Link>
        }
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
          ) : requests.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="Nenhuma solicitação"
              description="Crie uma nova solicitação de horas extras."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Posto</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Data</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Horário</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Horas</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <p className="font-medium dark:text-white text-spark-dark">{r.employee?.full_name}</p>
                          <p className="text-xs dark:text-spark-dark-text text-spark-gray">{r.employee?.registration_number}</p>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{r.post?.name}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{formatDate(r.request_date)}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">{r.start_time} - {r.end_time}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono">{r.total_hours}h</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{TYPE_LABELS[r.overtime_type] || r.overtime_type}</td>
                        <td className="py-3 px-4">
                          <Badge variant={STATUS_VARIANTS[r.status] || 'default'}>
                            {STATUS_LABELS[r.status] || r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {r.status === 'PENDENTE' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleReview(r.id, 'APROVADO')} className="text-green-500 hover:text-green-600">
                                  <Check className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleReview(r.id, 'REJEITADO')} className="text-red-500 hover:text-red-600">
                                  <X className="size-4" />
                                </Button>
                              </>
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

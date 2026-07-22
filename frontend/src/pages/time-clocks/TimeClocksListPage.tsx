import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Search, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface TimeClock {
  id: string;
  clock_type: string;
  clock_time: string;
  status: string;
  irregularity: string | null;
  justification: string | null;
  source: string;
  employee: { id: string; full_name: string; registration_number: string };
  post: { id: string; name: string; code: string };
  approver: { id: string; full_name: string } | null;
}

interface TimeClocksResponse {
  data: TimeClock[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const CLOCK_TYPE_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  ALMOCO_SAIDA: 'Almoço Saída',
  ALMOCO_RETORNO: 'Almoço Retorno',
};

const CLOCK_TYPE_VARIANTS: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  ENTRADA: 'success',
  SAIDA: 'info',
  ALMOCO_SAIDA: 'warning',
  ALMOCO_RETORNO: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  VALIDO: 'Válido',
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  JUSTIFICADO: 'Justificado',
};

export function TimeClocksListPage() {
  const [clocks, setClocks] = useState<TimeClock[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [postFilter, setPostFilter] = useState('');
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => { fetchClocks(); }, [page, search, statusFilter, postFilter]);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: { id: string; name: string }[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: p.name })));
    } catch { /* empty */ }
  };

  const fetchClocks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (postFilter) params.append('post_id', postFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<TimeClocksResponse>(`/time-clocks?${params.toString()}`);
      setClocks(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar registros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/time-clocks/${id}/approve`);
      toast.success('Registro aprovado!');
      fetchClocks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao aprovar');
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Controle de Ponto"
        subtitle="Registros de ponto dos colaboradores"
        actions={
          <Link to="/time-clocks/register">
            <Button>
              <Plus className="size-4 mr-2" />
              Registrar Ponto
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
                options={[{ value: '', label: 'Todos os postos' }, ...postOptions]}
                value={postFilter}
                onChange={setPostFilter}
                placeholder="Posto"
              />
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
          ) : clocks.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhum registro encontrado"
              description="Registre o ponto ou ajuste os filtros."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Posto</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Irregularidade</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clocks.map((c) => (
                      <tr key={c.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <p className="font-medium dark:text-white text-spark-dark">{c.employee?.full_name}</p>
                          <p className="text-xs dark:text-spark-dark-text text-spark-gray">{c.employee?.registration_number}</p>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{c.post?.name}</td>
                        <td className="py-3 px-4">
                          <p className="dark:text-spark-dark-text text-spark-gray">{formatDate(c.clock_time)}</p>
                          <p className="text-xs font-mono dark:text-spark-dark-text text-spark-gray">{formatTime(c.clock_time)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={CLOCK_TYPE_VARIANTS[c.clock_type] || 'default'}>
                            {CLOCK_TYPE_LABELS[c.clock_type] || c.clock_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {STATUS_LABELS[c.status] || c.status}
                        </td>
                        <td className="py-3 px-4">
                          {c.irregularity ? (
                            <Badge variant="danger">{c.irregularity}</Badge>
                          ) : (
                            <span className="dark:text-spark-dark-text text-spark-gray">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {c.irregularity && c.status !== 'APROVADO' && (
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(c.id)} className="text-green-500 hover:text-green-600">
                                <Check className="size-4" />
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

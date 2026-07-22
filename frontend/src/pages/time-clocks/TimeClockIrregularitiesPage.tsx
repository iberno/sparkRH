import { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface Irregularity {
  id: string;
  clock_type: string;
  clock_time: string;
  irregularity: string;
  justification: string | null;
  status: string;
  employee: { id: string; full_name: string; registration_number: string };
  post: { id: string; name: string; code: string };
}

interface IrregularitiesResponse {
  data: Irregularity[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const IRREGULARITY_LABELS: Record<string, string> = {
  SAIDA_TARDIA: 'Saída Tardia',
  HORAS_EXCESSIVAS: 'Horas Excessivas',
  INTERVALO_CURTO: 'Intervalo Curto',
  ATRASO: 'Atraso',
  FALTA: 'Falta',
};

export function TimeClockIrregularitiesPage() {
  const [items, setItems] = useState<Irregularity[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [postFilter, setPostFilter] = useState('');
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => { fetchIrregularities(); }, [page, postFilter]);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: { id: string; name: string }[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: p.name })));
    } catch { /* empty */ }
  };

  const fetchIrregularities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (postFilter) params.append('post_id', postFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<IrregularitiesResponse>(`/time-clocks/irregularities?${params.toString()}`);
      setItems(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar irregularidades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/time-clocks/${id}/approve`);
      toast.success('Irregularidade aprovada!');
      fetchIrregularities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao aprovar');
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Irregularidades de Ponto"
        subtitle="Registros que necessitam atenção"
      />

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[{ value: '', label: 'Todos os postos' }, ...postOptions]}
                value={postFilter}
                onChange={setPostFilter}
                placeholder="Posto"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Nenhuma irregularidade"
              description="Todos os registros estão regulares."
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
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Irregularidade</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Justificativa</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <p className="font-medium dark:text-white text-spark-dark">{item.employee?.full_name}</p>
                          <p className="text-xs dark:text-spark-dark-text text-spark-gray">{item.employee?.registration_number}</p>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{item.post?.name}</td>
                        <td className="py-3 px-4">
                          <p className="dark:text-spark-dark-text text-spark-gray">{formatDate(item.clock_time)}</p>
                          <p className="text-xs font-mono dark:text-spark-dark-text text-spark-gray">{formatTime(item.clock_time)}</p>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{item.clock_type}</td>
                        <td className="py-3 px-4">
                          <Badge variant="danger">{IRREGULARITY_LABELS[item.irregularity] || item.irregularity}</Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {item.justification || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== 'APROVADO' && (
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(item.id)} className="text-green-500 hover:text-green-600">
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, Edit, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface Schedule {
  id: string;
  shift_name: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  status: string;
  employee: { id: string; full_name: string; registration_number: string };
  post: { id: string; name: string; code: string };
}

interface ScheduleTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string;
  schedule_type: string;
  rotation_pattern: string | null;
  is_default: boolean;
  post: { id: string; name: string; code: string };
}

interface SchedulesResponse {
  data: Schedule[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const STATUS_LABELS: Record<string, string> = {
  PROGRAMADO: 'Programado',
  CONFIRMADO: 'Confirmado',
  AUSENTE: 'Ausente',
  CANCELADO: 'Cancelado',
  TROCA_PENDENTE: 'Troca Pendente',
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PROGRAMADO: 'info',
  CONFIRMADO: 'success',
  AUSENTE: 'danger',
  CANCELADO: 'default',
  TROCA_PENDENTE: 'warning',
};

const DAY_LABELS: Record<string, string> = {
  '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb',
};

export function SchedulesListPage() {
  const [activeTab, setActiveTab] = useState<'generated' | 'templates'>('generated');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);
  const [postFilter, setPostFilter] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab === 'generated') fetchSchedules();
    else fetchTemplates();
  }, [page, search, statusFilter, postFilter, activeTab]);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: { id: string; name: string }[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: p.name })));
    } catch { /* empty */ }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (postFilter) params.append('post_id', postFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<SchedulesResponse>(`/schedules?${params.toString()}`);
      setSchedules(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar escalas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (postFilter) params.append('post_id', postFilter);
      const res = await api.get(`/schedules/templates?${params.toString()}`);
      const raw = res.data as any;
      const list = Array.isArray(raw) ? raw : raw?.data;
      setTemplates(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar modelos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;
    try {
      if (activeTab === 'generated') {
        await api.delete(`/schedules/${id}`);
      } else {
        await api.delete(`/schedules/templates/${id}`);
      }
      toast.success('Excluído com sucesso!');
      if (activeTab === 'generated') fetchSchedules();
      else fetchTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Escalas"
        subtitle="Gestão de escalas de trabalho"
        actions={
          <div className="flex gap-2">
            {activeTab === 'generated' && (
              <Link to="/schedules/generate">
                <Button>
                  <Plus className="size-4 mr-2" />
                  Gerar Escala
                </Button>
              </Link>
            )}
            {activeTab === 'templates' && (
              <Link to="/schedules/new">
                <Button>
                  <Plus className="size-4 mr-2" />
                  Novo Modelo
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <Card>
        <CardContent>
          <div className="flex border-b dark:border-spark-dark-border border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'generated'
                  ? 'border-spark-primary text-spark-primary'
                  : 'border-transparent dark:text-spark-dark-text text-spark-gray hover:text-spark-dark dark:hover:text-white'
              }`}
            >
              Escalas Geradas
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-spark-primary text-spark-primary'
                  : 'border-transparent dark:text-spark-dark-text text-spark-gray hover:text-spark-dark dark:hover:text-white'
              }`}
            >
              Modelos de Escala
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 dark:text-spark-dark-text text-spark-gray" />
                <Input
                  placeholder="Buscar..."
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
            {activeTab === 'generated' && (
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
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : activeTab === 'generated' ? (
            schedules.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nenhuma escala encontrada"
                description="Gere escalas para os postos de trabalho."
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
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Turno</th>
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                        <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((s) => (
                        <tr key={s.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                          <td className="py-3 px-4">
                            <p className="font-medium dark:text-white text-spark-dark">{s.employee?.full_name}</p>
                            <p className="text-xs dark:text-spark-dark-text text-spark-gray">{s.employee?.registration_number}</p>
                          </td>
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{s.post?.name}</td>
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{formatDate(s.schedule_date)}</td>
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">{s.start_time} - {s.end_time}</td>
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{s.shift_name}</td>
                          <td className="py-3 px-4">
                            <Badge variant={STATUS_VARIANTS[s.status] || 'default'}>
                              {STATUS_LABELS[s.status] || s.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600">
                                <Trash2 className="size-4" />
                              </Button>
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
            )
          ) : (
            templates.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nenhum modelo encontrado"
                description="Crie um modelo de escala para gerar escalas automaticamente."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Nome</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Posto</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Horário</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Dias</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Padrão</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <CalendarDays className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">{t.name}</p>
                              {t.is_default && <Badge variant="success" className="text-xs mt-0.5">Padrão</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{t.post?.name}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">{t.start_time} - {t.end_time}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-xs">
                          {t.days_of_week.split(',').map(d => DAY_LABELS[d]).join(', ')}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{t.schedule_type}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">{t.rotation_pattern || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/schedules/${t.id}/edit`}>
                              <Button variant="ghost" size="sm"><Edit className="size-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-600">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

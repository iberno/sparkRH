import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Assignment {
  id: string;
  start_date: string;
  end_date: string | null;
  shift: string | null;
  position: string | null;
  base_salary: number | null;
  additional: number;
  status: string;
  employee: { full_name: string; cpf: string; registration_number: string };
  post: { name: string; code: string | null };
}

interface AssignmentsResponse {
  data: Assignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function AssignmentsListPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<AssignmentsResponse>(`/assignments?${params.toString()}`);
      setAssignments(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar alocações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, search, statusFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/assignments/${confirmId}`);
      toast.success('Alocação excluída com sucesso!');
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir alocação');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger'> = {
      ATIVA: 'success',
      SUSPENSA: 'warning',
      ENCERRADA: 'danger',
    };
    return map[status] || 'default';
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return '—';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <PageHeader
        title="Alocações"
        subtitle="Gestão de alocação de colaboradores em postos"
        actions={
          <Link to="/assignments/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Nova Alocação
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
                  placeholder="Buscar por colaborador, posto ou matrícula..."
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
                  { value: 'ATIVA', label: 'Ativa' },
                  { value: 'SUSPENSA', label: 'Suspensa' },
                  { value: 'ENCERRADA', label: 'Encerrada' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Todos os status"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Nenhuma alocação encontrada"
              description="Ajuste os filtros ou cadastre uma nova alocação."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Posto</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Escala</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Início</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Fim</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Salário</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium dark:text-white text-spark-dark">{a.employee.full_name}</p>
                            <p className="text-xs dark:text-spark-dark-text text-spark-gray">{a.employee.registration_number}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          <span>{a.post.name}</span>
                          {a.post.code && <span className="text-xs ml-1 opacity-70">({a.post.code})</span>}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">{a.shift || '—'}</td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {new Date(a.start_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {a.end_date ? new Date(a.end_date).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">{formatCurrency(a.base_salary)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(a.status)}>
                            {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/assignments/${a.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(a.id); setConfirmOpen(true); }}
                              className="text-red-500 hover:text-red-600"
                            >
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
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmId(null); }}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta alocação?"
        variant="danger"
      />
    </div>
  );
}

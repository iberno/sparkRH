import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Edit, Eye, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { EMPLOYEE_STATUS_LABELS } from '../../lib/constants';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Employee {
  id: string;
  registration_number: string;
  cpf: string;
  full_name: string;
  social_name: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  status: string;
  admission_date: string;
  created_at: string;
}

interface EmployeesResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function EmployeesListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<EmployeesResponse>(`/employees?${params.toString()}`);
      setEmployees(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search, statusFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/employees/${confirmId}`);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar colaborador');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmName('');
    }
  };

  const formatCpf = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      ATIVO: 'success',
      AFASTADO: 'warning',
      FERIAS: 'info',
      DEMITIDO: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        subtitle="Gestão de colaboradores da empresa"
        actions={
          <Link to="/employees/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Colaborador
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
                  placeholder="Buscar por CPF, nome, matrícula ou e-mail..."
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
                  ...Object.entries(EMPLOYEE_STATUS_LABELS).map(([key, label]) => ({ value: key, label })),
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
          ) : employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum colaborador encontrado"
              description="Ajuste os filtros ou cadastre um novo colaborador."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Matrícula</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">CPF</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Admissão</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <UserCheck className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {emp.social_name || emp.full_name}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                {emp.email || 'Sem e-mail'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">
                          {emp.registration_number}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {formatCpf(emp.cpf)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(emp.status)}>
                            {EMPLOYEE_STATUS_LABELS[emp.status as keyof typeof EMPLOYEE_STATUS_LABELS] || emp.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {new Date(emp.admission_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/employees/${emp.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Link to={`/employees/${emp.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(emp.id); setConfirmName(emp.full_name); setConfirmOpen(true); }}
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
        onClose={() => { setConfirmOpen(false); setConfirmId(null); setConfirmName(''); }}
        onConfirm={handleDelete}
        title="Confirmar desativação"
        message={`Tem certeza que deseja desativar ${confirmName}?`}
        variant="warning"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}

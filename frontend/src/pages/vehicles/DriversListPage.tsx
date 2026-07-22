import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Driver {
  id: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;
  cfc_name: string | null;
  cfc_validity: string | null;
  status: string;
  employee: {
    id: string;
    full_name: string;
    cpf: string;
    registration_number: string;
  };
}

interface DriversResponse {
  data: Driver[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function DriversListPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<DriversResponse>(`/drivers?${params.toString()}`);
      setDrivers(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar motoristas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, statusFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/drivers/${confirmId}`);
      toast.success('Motorista desativado com sucesso!');
      fetchDrivers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar motorista');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmName('');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'danger'> = {
      ATIVO: 'success',
      INATIVO: 'danger',
    };
    return map[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
    };
    return map[status] || status;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <PageHeader
        title="Motoristas"
        subtitle="Gestão de motoristas e CNH"
        actions={
          <Link to="/drivers/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Motorista
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
                  placeholder="Buscar por nome, CPF, CNH ou matrícula..."
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
                  { value: 'ATIVO', label: 'Ativo' },
                  { value: 'INATIVO', label: 'Inativo' },
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
          ) : drivers.length === 0 ? (
            <EmptyState
              icon={Bike}
              title="Nenhum motorista encontrado"
              description="Ajuste os filtros ou cadastre um novo motorista."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Motorista</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">CNH</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Categoria</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Validade CNH</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">CFC</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Validade CFC</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((d) => (
                      <tr key={d.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <Bike className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {d.employee.full_name}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                Matrícula: {d.employee.registration_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs dark:text-spark-dark-text text-spark-gray">
                          {d.cnh_number}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-medium">
                          {d.cnh_category}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(d.cnh_expiry)}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {d.cfc_name || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(d.cfc_validity)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(d.status)}>
                            {getStatusLabel(d.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/drivers/${d.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(d.id); setConfirmName(d.employee.full_name); setConfirmOpen(true); }}
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
        message={`Tem certeza que deseja desativar o motorista ${confirmName}?`}
        variant="warning"
      />
    </div>
  );
}

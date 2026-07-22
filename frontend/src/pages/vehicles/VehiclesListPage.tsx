import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string | null;
  year: number | null;
  color: string | null;
  fuel_type: string | null;
  km_current: number | null;
  insurance_expiry: string | null;
  licensing_expiry: string | null;
  status: string;
}

interface VehiclesResponse {
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function VehiclesListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<VehiclesResponse>(`/vehicles?${params.toString()}`);
      setVehicles(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar veículos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search, statusFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/vehicles/${confirmId}`);
      toast.success('Veículo desativado com sucesso!');
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar veículo');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmName('');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger'> = {
      ATIVO: 'success',
      MANUTENCAO: 'warning',
      INATIVO: 'danger',
    };
    return map[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ATIVO: 'Ativo',
      MANUTENCAO: 'Manutenção',
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
        title="Veículos"
        subtitle="Gestão de frota"
        actions={
          <Link to="/vehicles/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Veículo
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
                  placeholder="Buscar por placa, modelo ou marca..."
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
                  { value: 'MANUTENCAO', label: 'Manutenção' },
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
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="Nenhum veículo encontrado"
              description="Ajuste os filtros ou cadastre um novo veículo."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Placa</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Modelo/Marca</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ano</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Cor</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">KM</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Seguro</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Licenciamento</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4 font-mono font-medium dark:text-white text-spark-dark">
                          {v.plate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <Car className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {v.model}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                {v.brand || 'Sem marca'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {v.year || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {v.color || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">
                          {v.km_current != null ? v.km_current.toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(v.insurance_expiry)}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(v.licensing_expiry)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(v.status)}>
                            {getStatusLabel(v.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/vehicles/${v.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(v.id); setConfirmName(v.plate); setConfirmOpen(true); }}
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
        message={`Tem certeza que deseja desativar o veículo ${confirmName}?`}
        variant="warning"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}

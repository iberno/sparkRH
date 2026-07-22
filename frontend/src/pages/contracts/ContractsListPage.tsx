import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface Contract {
  id: string;
  contract_number: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  total_value: number;
  status: string;
  client: { name: string };
  company: { name: string };
}

interface ContractsResponse {
  data: Contract[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  ENCERRADO: 'Encerrado',
  EM_RENOVACAO: 'Em Renovação',
};

export function ContractsListPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<ContractsResponse>(`/contracts?${params.toString()}`);
      setContracts(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar contratos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, search, statusFilter]);

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Tem certeza que deseja excluir o contrato ${number}?`)) return;

    try {
      await api.delete(`/contracts/${id}`);
      toast.success('Contrato excluído com sucesso!');
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir contrato');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      ATIVO: 'success',
      SUSPENSO: 'warning',
      ENCERRADO: 'danger',
      EM_RENOVACAO: 'info',
    };
    return map[status] || 'default';
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  return (
    <div>
      <PageHeader
        title="Contratos"
        subtitle="Gestão de contratos"
        actions={
          <Link to="/contracts/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Contrato
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
                  placeholder="Buscar por número, descrição ou cliente..."
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
                  ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ value: key, label })),
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
          ) : contracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum contrato encontrado"
              description="Ajuste os filtros ou cadastre um novo contrato."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Número</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Empresa</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Vigência</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Valor</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <FileText className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {contract.contract_number}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                {contract.description || 'Sem descrição'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {contract.client?.name || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {contract.company?.name || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {formatDate(contract.start_date)}
                          {contract.end_date ? ` - ${formatDate(contract.end_date)}` : ' - ...'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-right font-mono text-xs">
                          {formatCurrency(contract.total_value)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(contract.status)}>
                            {STATUS_LABELS[contract.status] || contract.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/contracts/${contract.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Link to={`/contracts/${contract.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contract.id, contract.contract_number)}
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
    </div>
  );
}

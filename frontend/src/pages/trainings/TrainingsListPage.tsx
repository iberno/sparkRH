import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Plus, Search, Edit, Trash2, Clock, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface Training {
  id: string;
  name: string;
  category: string;
  provider: string | null;
  workload: number | null;
  start_date: string;
  end_date: string | null;
  expiry_date: string | null;
  certificate_number: string | null;
  status: string;
  employee: {
    id: string;
    full_name: string;
    cpf: string;
    registration_number: string;
  };
  created_at: string;
}

interface TrainingsResponse {
  data: Training[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  NR_10: 'NR-10',
  NR_12: 'NR-12',
  NR_20: 'NR-20',
  NR_35: 'NR-35',
  DEFESA_PESSOAL: 'Defesa Pessoal',
  PRIMEIROS_SOCORROS: 'Primeiros Socorros',
  MANIPULACAO_EXTINTORES: 'Extintores',
  CFTV_MONITORAMENTO: 'CFTV',
  RECICLAGEM_SENAI: 'SENAI',
  OUTROS: 'Outros',
};

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas as categorias' },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
};

export function TrainingsListPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<TrainingsResponse>(`/trainings?${params.toString()}`);
      setTrainings(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar treinamentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [page, search, categoryFilter, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o treinamento "${name}"?`)) return;

    try {
      await api.delete(`/trainings/${id}`);
      fetchTrainings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir treinamento');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'info' | 'danger' | 'default'> = {
      CONCLUIDO: 'success',
      EM_ANDAMENTO: 'info',
      VENCIDO: 'danger',
      CANCELADO: 'default',
    };
    return map[status] || 'default';
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <PageHeader
        title="Treinamentos"
        subtitle="Gestão de treinamentos e certificações"
        actions={
          <Link to="/trainings/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Treinamento
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
                  placeholder="Buscar por nome, fornecedor ou certificado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={CATEGORY_OPTIONS}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="Todas as categorias"
              />
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={STATUS_OPTIONS}
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
          ) : trainings.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Nenhum treinamento encontrado"
              description="Ajuste os filtros ou cadastre um novo treinamento."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Treinamento</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Fornecedor</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Carga Horária</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Validade</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((t) => (
                      <tr key={t.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <Award className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {t.employee.full_name}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray font-mono">
                                {t.employee.registration_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium dark:text-white text-spark-dark">{t.name}</p>
                            <Badge variant="default" className="mt-1">
                              {CATEGORY_LABELS[t.category] || t.category}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {t.provider || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {t.workload ? `${t.workload}h` : '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(t.expiry_date)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(t.status)}>
                            {STATUS_LABELS[t.status] || t.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/trainings/${t.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(t.id, t.name)}
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

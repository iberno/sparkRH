import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface WorkPost {
  id: string;
  code: string;
  name: string;
  post_type: string;
  schedule_type: string | null;
  required_vacancies: number;
  status: string;
  contract: {
    contract_number: string;
    client: {
      name: string;
    };
  };
}

interface WorkPostsResponse {
  data: WorkPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const POST_TYPE_LABELS: Record<string, string> = {
  VIGILANCIA: 'Vigilância',
  PORTARIA: 'Portaria',
  RONDA: 'Ronda',
  MONITORAMENTO: 'Monitoramento',
  LIMPEZA: 'Limpeza',
  JARDINAGEM: 'Jardinagem',
  INSPECAO: 'Inspeção',
  FISCAL_LOJA: 'Fiscal de Loja',
};

const postTypeOptions = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(POST_TYPE_LABELS).map(([key, label]) => ({ value: key, label })),
];

export function WorkPostsListPage() {
  const [workPosts, setWorkPosts] = useState<WorkPost[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchWorkPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (postTypeFilter) params.append('post_type', postTypeFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<WorkPostsResponse>(`/work-posts?${params.toString()}`);
      setWorkPosts(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar postos de trabalho');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkPosts();
  }, [page, search, postTypeFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja desativar ${name}?`)) return;

    try {
      await api.delete(`/work-posts/${id}`);
      toast.success('Posto desativado com sucesso!');
      fetchWorkPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar posto');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'danger'> = {
      ATIVO: 'success',
      INATIVO: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <PageHeader
        title="Postos de Trabalho"
        subtitle="Gestão de postos"
        actions={
          <Link to="/work-posts/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Posto
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
                  placeholder="Buscar por código, nome ou contrato..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-56">
              <PrelineSelect
                options={postTypeOptions}
                value={postTypeFilter}
                onChange={setPostTypeFilter}
                placeholder="Todos os tipos"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : workPosts.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Nenhum posto encontrado"
              description="Ajuste os filtros ou cadastre um novo posto de trabalho."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Código</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Nome</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Escala</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Vagas</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Contrato</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workPosts.map((wp) => (
                      <tr key={wp.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">
                          {wp.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <MapPin className="size-4 text-spark-primary" />
                            </div>
                            <p className="font-medium dark:text-white text-spark-dark">
                              {wp.name}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {POST_TYPE_LABELS[wp.post_type] || wp.post_type}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {wp.schedule_type || '-'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {wp.required_vacancies}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-xs">
                          {wp.contract.contract_number} - {wp.contract.client.name}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(wp.status)}>
                            {wp.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/work-posts/${wp.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Link to={`/work-posts/${wp.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(wp.id, wp.name)}
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

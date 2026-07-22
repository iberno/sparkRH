import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Aso {
  id: string;
  type: string;
  exam_date: string;
  expiry_date: string | null;
  doctor_name: string | null;
  doctor_crm: string | null;
  clinic_name: string | null;
  result: string;
  restrictions: string | null;
  status: string;
  is_mandatory: boolean;
  employee: { id: string; full_name: string; cpf: string; registration_number: string };
  created_at: string;
}

interface AsosResponse {
  data: Aso[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const TYPE_LABELS: Record<string, string> = {
  ADMISSIONAL: 'Admissional',
  DEMISSIONAL: 'Demissional',
  PERIODICO: 'Periódico',
  RETORNO_TRABALHO: 'Retorno ao Trabalho',
  MUDANCA_FUNCAO: 'Mudança de Função',
};

const RESULT_VARIANTS: Record<string, 'success' | 'danger'> = {
  APTO: 'success',
  INAPTO: 'danger',
};

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'default'> = {
  VALIDO: 'success',
  VENCIDO: 'danger',
  CANCELADO: 'default',
};

export function AsosListPage() {
  const [asos, setAsos] = useState<Aso[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchAsos = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (resultFilter) params.append('result', resultFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<AsosResponse>(`/asos?${params.toString()}`);
      setAsos(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar ASOs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAsos();
  }, [page, search, typeFilter, resultFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/asos/${confirmId}`);
      toast.success('ASO excluído com sucesso!');
      fetchAsos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir ASO');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="ASOs"
        subtitle="Atestados de Saúde Ocupacional"
        actions={
          <Link to="/asos/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo ASO
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
                  placeholder="Buscar por colaborador, médico, clínica..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todos os tipos' },
                  ...Object.entries(TYPE_LABELS).map(([key, label]) => ({ value: key, label })),
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Todos os tipos"
              />
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todos os resultados' },
                  { value: 'APTO', label: 'Apto' },
                  { value: 'INAPTO', label: 'Inapto' },
                ]}
                value={resultFilter}
                onChange={setResultFilter}
                placeholder="Todos os resultados"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : asos.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="Nenhum ASO encontrado"
              description="Ajuste os filtros ou cadastre um novo ASO."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Data Exame</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Validade</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Resultado</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Médico</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asos.map((aso) => (
                      <tr key={aso.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium dark:text-white text-spark-dark">
                              {aso.employee.full_name}
                            </p>
                            <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                              {aso.employee.registration_number}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {TYPE_LABELS[aso.type] || aso.type}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {new Date(aso.exam_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {aso.expiry_date ? new Date(aso.expiry_date).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={RESULT_VARIANTS[aso.result] || 'default'}>
                            {aso.result === 'APTO' ? 'Apto' : 'Inapto'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {aso.doctor_name || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={STATUS_VARIANTS[aso.status] || 'default'}>
                            {aso.status === 'VALIDO' ? 'Válido' : aso.status === 'VENCIDO' ? 'Vencido' : 'Cancelado'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/asos/${aso.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(aso.id); setConfirmOpen(true); }}
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
        message="Tem certeza que deseja excluir este ASO?"
        variant="danger"
      />
    </div>
  );
}

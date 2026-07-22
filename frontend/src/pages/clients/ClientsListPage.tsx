import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface Client {
  id: string;
  name: string;
  type: 'JURIDICA' | 'FISICA';
  cnpj_cpf: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
}

interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get<ClientsResponse>(`/clients?${params.toString()}`);
      setClients(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, search, typeFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/clients/${confirmId}`);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar cliente');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmName('');
    }
  };

  const formatCnpjCpf = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gestão de clientes"
        actions={
          <Link to="/clients/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Cliente
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
                  placeholder="Buscar por nome, CNPJ/CPF ou contato..."
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
                  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
                  { value: 'FISICA', label: 'Pessoa Física' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Todos os tipos"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhum cliente encontrado"
              description="Ajuste os filtros ou cadastre um novo cliente."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Nome</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">CNPJ/CPF</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Contato</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Cidade/UF</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <Building2 className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {client.name}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                {client.contact_name || 'Sem contato'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={client.type === 'JURIDICA' ? 'info' : 'warning'}>
                            {client.type === 'JURIDICA' ? 'Jurídica' : 'Física'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray font-mono text-xs">
                          {formatCnpjCpf(client.cnpj_cpf)}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {client.contact_phone || client.contact_email || '—'}
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {client.city && client.state ? `${client.city}/${client.state}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={client.is_active ? 'success' : 'danger'}>
                            {client.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/clients/${client.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Link to={`/clients/${client.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(client.id); setConfirmName(client.name); setConfirmOpen(true); }}
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

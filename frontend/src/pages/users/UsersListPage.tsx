import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { ROLES } from '../../lib/constants';
import { PageHeader, EmptyState } from '../../components/custom';
import { Button, Input, Card, CardContent, Badge, Pagination, Spinner, PrelineSelect, ConfirmModal } from '../../components/ui';

interface User {
  id: string;
  cpf: string;
  email: string | null;
  role: string;
  is_active: boolean;
  is_first_access: boolean;
  last_login: string | null;
  employee: {
    id: string;
    full_name: string;
    social_name: string | null;
    registration_number: string;
    phone: string | null;
    email: string | null;
    photo_url: string | null;
  } | null;
}

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
      setUsers(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/users/${confirmId}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao desativar usuário');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
      ADMIN: { label: 'Admin', variant: 'danger' },
      MANAGER: { label: 'Gerente', variant: 'warning' },
      SUPERVISOR: { label: 'Supervisor', variant: 'info' },
      DP_RH: { label: 'DP/RH', variant: 'primary' },
      EMPLOYEE: { label: 'Colaborador', variant: 'success' },
    };

    const config = roleConfig[role] || { label: role, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Gerenciamento de usuários do sistema"
        actions={
          <Link to="/users/new">
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Usuário
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 dark:text-spark-dark-text text-spark-gray" />
                <Input
                  placeholder="Buscar por CPF, nome ou e-mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todos os perfis' },
                  ...Object.entries(ROLES).map(([key, label]) => ({ value: key, label })),
                ]}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Todos os perfis"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description="Ajuste os filtros ou crie um novo usuário."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-spark-dark-border border-gray-200">
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Usuário</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">CPF</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Perfil</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Status</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Último Acesso</th>
                      <th className="text-right py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b dark:border-spark-dark-border border-gray-100 hover:bg-gray-50 dark:hover:bg-spark-dark-surface">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-spark-primary/10 flex items-center justify-center">
                              <UserCheck className="size-4 text-spark-primary" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white text-spark-dark">
                                {user.employee?.full_name || 'Sem nome'}
                              </p>
                              <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                                {user.email || 'Sem e-mail'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                          {user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.is_active ? 'success' : 'danger'}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-sm">
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString('pt-BR')
                            : 'Nunca'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/users/${user.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Link to={`/users/${user.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConfirmId(user.id); setConfirmOpen(true); }}
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

              {/* Pagination */}
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
        title="Confirmar desativação"
        message="Tem certeza que deseja desativar este usuário?"
        variant="warning"
      />
    </div>
  );
}

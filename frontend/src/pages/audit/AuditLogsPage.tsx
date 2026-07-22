import { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader, EmptyState } from '../../components/custom';
import { Card, CardContent, Badge, Pagination, Spinner, PrelineSelect } from '../../components/ui';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    id: string;
    cpf: string;
    employee: {
      full_name: string;
    } | null;
  } | null;
}

interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (entityFilter) params.append('entity', entityFilter);
      if (actionFilter) params.append('action', actionFilter);
      params.append('page', meta.page.toString());

      const response = await api.get<AuditLogsResponse>(`/audit-logs?${params.toString()}`);
      setLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [meta.page, entityFilter, actionFilter]);

  const getActionBadge = (action: string) => {
    const actionConfig: Record<string, { variant: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
      CREATE: { variant: 'success' },
      UPDATE: { variant: 'warning' },
      DELETE: { variant: 'danger' },
      LOGIN: { variant: 'primary' },
      LOGOUT: { variant: 'info' },
    };

    const config = actionConfig[action] || { variant: 'default' as const };
    return <Badge variant={config.variant}>{action}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <PageHeader
        title="Logs de Auditoria"
        subtitle="Histórico de ações realizadas no sistema"
      />

      <Card>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todas as entidades' },
                  { value: 'users', label: 'Usuários' },
                  { value: 'employees', label: 'Colaboradores' },
                  { value: 'contracts', label: 'Contratos' },
                  { value: 'posts', label: 'Postos' },
                  { value: 'scales', label: 'Escalas' },
                  { value: 'time_clocks', label: 'Ponto' },
                ]}
                value={entityFilter}
                onChange={setEntityFilter}
                placeholder="Todas as entidades"
              />
            </div>
            <div className="w-full sm:w-48">
              <PrelineSelect
                options={[
                  { value: '', label: 'Todas as ações' },
                  { value: 'CREATE', label: 'Criação' },
                  { value: 'UPDATE', label: 'Atualização' },
                  { value: 'DELETE', label: 'Exclusão' },
                  { value: 'LOGIN', label: 'Login' },
                ]}
                value={actionFilter}
                onChange={setActionFilter}
                placeholder="Todas as ações"
              />
            </div>
          </div>

          {/* Logs */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhum log encontrado"
              description="Ajuste os filtros para ver os registros."
            />
          ) : (
            <>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border dark:border-spark-dark-border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-spark-dark-surface"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="flex items-center gap-4">
                        {getActionBadge(log.action)}
                        <div>
                          <p className="font-medium dark:text-white text-spark-dark">
                            {log.user?.employee?.full_name || log.user?.cpf || 'Sistema'}
                          </p>
                          <p className="text-sm dark:text-spark-dark-text text-spark-gray">
                            {log.entity} • {formatDate(log.created_at)}
                          </p>
                        </div>
                      </div>
                      {expandedLog === log.id ? (
                        <ChevronUp className="size-4 dark:text-spark-dark-text text-spark-gray" />
                      ) : (
                        <ChevronDown className="size-4 dark:text-spark-dark-text text-spark-gray" />
                      )}
                    </div>

                    {expandedLog === log.id && (
                      <div className="px-4 pb-4 border-t dark:border-spark-dark-border border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs font-medium dark:text-spark-dark-text text-spark-gray mb-1">
                              IP
                            </p>
                            <p className="text-sm dark:text-white text-spark-dark">
                              {log.ip_address || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium dark:text-spark-dark-text text-spark-gray mb-1">
                              User Agent
                            </p>
                            <p className="text-sm dark:text-white text-spark-dark truncate">
                              {log.user_agent || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {log.old_values && (
                          <div className="mt-4">
                            <p className="text-xs font-medium dark:text-spark-dark-text text-spark-gray mb-1">
                              Valores Anteriores
                            </p>
                            <pre className="text-xs dark:bg-spark-dark-bg bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.new_values && (
                          <div className="mt-4">
                            <p className="text-xs font-medium dark:text-spark-dark-text text-spark-gray mb-1">
                              Novos Valores
                            </p>
                            <pre className="text-xs dark:bg-spark-dark-bg bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={(page) => setMeta({ ...meta, page })}
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

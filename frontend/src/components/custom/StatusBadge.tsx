import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
  colors?: Record<string, string>;
  labels?: Record<string, string>;
}

const defaultColors: Record<string, string> = {
  ATIVO: 'success',
  AFASTADO: 'warning',
  FERIAS: 'info',
  DEMITIDO: 'danger',
  SUSPENSO: 'warning',
  ENCERRADO: 'danger',
  EM_RENOVACAO: 'info',
  PENDENTE: 'warning',
  CALCULADO: 'info',
  APROVADO: 'success',
  PAGO: 'success',
  PROGRAMADO: 'info',
  EM_GOZO: 'primary',
  CONCLUIDO: 'success',
  CANCELADO: 'danger',
};

const defaultLabels: Record<string, string> = {
  ATIVO: 'Ativo',
  AFASTADO: 'Afastado',
  FERIAS: 'Férias',
  DEMITIDO: 'Demitido',
  SUSPENSO: 'Suspenso',
  ENCERRADO: 'Encerrado',
  EM_RENOVACAO: 'Em Renovação',
  PENDENTE: 'Pendente',
  CALCULADO: 'Calculado',
  APROVADO: 'Aprovado',
  PAGO: 'Pago',
  PROGRAMADO: 'Programado',
  EM_GOZO: 'Em Gozo',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export function StatusBadge({ status, colors, labels }: StatusBadgeProps) {
  const variant = (colors?.[status] || defaultColors[status] || 'default') as 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  const label = labels?.[status] || defaultLabels[status] || status;

  return <Badge variant={variant}>{label}</Badge>;
}

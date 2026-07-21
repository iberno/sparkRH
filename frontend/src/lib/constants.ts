export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SUPERVISOR: 'SUPERVISOR',
  DP_RH: 'DP_RH',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  SUPERVISOR: 'Supervisor',
  DP_RH: 'DP/RH',
  EMPLOYEE: 'Colaborador',
};

export const EMPLOYEE_STATUS = {
  ATIVO: 'ATIVO',
  AFASTADO: 'AFASTADO',
  FERIAS: 'FERIAS',
  DEMITIDO: 'DEMITIDO',
} as const;

export const EMPLOYEE_STATUS_LABELS: Record<keyof typeof EMPLOYEE_STATUS, string> = {
  ATIVO: 'Ativo',
  AFASTADO: 'Afastado',
  FERIAS: 'Férias',
  DEMITIDO: 'Demitido',
};

export const EMPLOYEE_STATUS_COLORS: Record<keyof typeof EMPLOYEE_STATUS, string> = {
  ATIVO: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400',
  AFASTADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400',
  FERIAS: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400',
  DEMITIDO: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400',
};

export const CONTRACT_STATUS = {
  ATIVO: 'ATIVO',
  SUSPENSO: 'SUSPENSO',
  ENCERRADO: 'ENCERRADO',
  EM_RENOVACAO: 'EM_RENOVACAO',
} as const;

export const POST_TYPES = {
  VIGILANCIA: 'Vigilância',
  PORTARIA: 'Portaria',
  RONDA: 'Ronda',
  MONITORAMENTO: 'Monitoramento',
  LIMPEZA: 'Limpeza',
  JARDINAGEM: 'Jardinagem',
  INSPECAO: 'Inspeção',
  FISCAL_LOJA: 'Fiscal de Loja',
} as const;

export const SCALE_TYPES = {
  FIXO: 'Fixo',
  ROTATIVO: 'Rotativo',
  MISTO: 'Misto',
} as const;

export const PAYROLL_STATUS = {
  PENDENTE: 'Pendente',
  CALCULADO: 'Calculado',
  APROVADO: 'Aprovado',
  PAGO: 'Pago',
} as const;

export const ITEMS_PER_PAGE = [10, 20, 50, 100];
export const DEFAULT_ITEMS_PER_PAGE = 20;

export const API_PREFIX = '/api/v1';

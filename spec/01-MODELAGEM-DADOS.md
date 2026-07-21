# SPEC - Modelagem de Dados (PostgreSQL + Prisma)

## Schema Completo do Banco de Dados

### Diagrama de Relacionamentos (ER)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   companies  │────<│  departments │────<│  employees   │
│  (empresas)  │     │(departamento)│     │(colaborador) │
└──────┬───────┘     └──────────────┘     └──────┬───────┘
       │                                          │
       │           ┌──────────────┐               │
       └──────────>│  contracts   │               │
                   │ (contratos)  │               │
                   └──────┬───────┘               │
                          │                       │
                   ┌──────▼───────┐               │
                   │  work_posts  │               │
                   │(postos)      │               │
                   └──────┬───────┘               │
                          │                       │
                   ┌──────▼───────┐     ┌────────▼────────┐
                   │  assignments │────<│  time_clocks    │
                   │ (alocações)  │     │ (marcações)     │
                   └──────────────┘     └─────────────────┘
```

---

## 1. Módulo de Autenticação & Acesso

### Tabela: `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf           VARCHAR(14) UNIQUE NOT NULL, -- CPF como login principal
  email         VARCHAR(255) UNIQUE, -- Opcional para colaboradores
  password_hash VARCHAR(255) NOT NULL,
  employee_id   UUID REFERENCES employees(id),
  role          VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- admin, manager, supervisor, dp_rh, employee
  is_active     BOOLEAN DEFAULT true,
  is_first_access BOOLEAN DEFAULT true, -- Primeiro acesso (define senha via SMS)
  last_login    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  deleted_at    TIMESTAMP
);
```

### Tabela: `user_permissions`
```sql
CREATE TABLE user_permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  module     VARCHAR(100) NOT NULL, -- 'employees', 'contracts', 'payroll', etc.
  action     VARCHAR(50) NOT NULL,  -- 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module, action)
);
```

### Tabela: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
  entity      VARCHAR(100) NOT NULL, -- 'employee', 'contract', etc.
  entity_id   UUID NOT NULL,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `verification_codes` (Códigos SMS/WhatsApp)
```sql
CREATE TABLE verification_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  cpf         VARCHAR(14) NOT NULL, -- Para busca rápida
  code_hash   VARCHAR(255) NOT NULL, -- Hash do código (não armazenar em texto plano)
  type        VARCHAR(30) NOT NULL, -- FIRST_ACCESS, FORGOT_PASSWORD, CHANGE_PASSWORD
  channel     VARCHAR(20) NOT NULL, -- SMS, WHATSAPP
  phone       VARCHAR(20) NOT NULL, -- Telefone destino
  attempts    INTEGER DEFAULT 0, -- Tentativas de uso
  max_attempts INTEGER DEFAULT 3,
  used        BOOLEAN DEFAULT false,
  expires_at  TIMESTAMP NOT NULL, -- Expira em 10 minutos
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida e limpeza
CREATE INDEX idx_verification_codes_cpf ON verification_codes(cpf);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);
```

### Tabela: `notification_channels` (Canais de Notificação)
```sql
CREATE TABLE notification_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  type        VARCHAR(20) NOT NULL, -- SMS, WHATSAPP, EMAIL, PUSH
  phone       VARCHAR(20),
  email       VARCHAR(255),
  is_primary  BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `n8n_agent_logs` (Logs do Agente Spark N8N)
```sql
CREATE TABLE n8n_agent_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  channel       VARCHAR(20) NOT NULL, -- WHATSAPP, SMS, WEBCHAT
  message_type  VARCHAR(50) NOT NULL, -- EPI_REQUEST, PAYSLIP_QUERY, TIMECLOCK_ADJUST, GENERAL
  request_data  JSONB, -- Dados da solicitação
  response_data JSONB, -- Resposta do agente
  status        VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSED, APPROVED, REJECTED, ERROR
  approved_by   UUID REFERENCES users(id),
  approved_at   TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### Enum Prisma:
```prisma
enum UserRole {
  ADMIN
  MANAGER
  SUPERVISOR
  DP_RH
  EMPLOYEE
}
```

---

## 2. Módulo de Gestão de Colaboradores

### Tabela: `employees`
```sql
CREATE TABLE employees (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL, -- Matrícula interna
  cpf                 VARCHAR(14) UNIQUE NOT NULL,
  rg                  VARCHAR(20),
  rg_org              VARCHAR(20), -- Órgão emissor
  rg_expiry           DATE,
  full_name           VARCHAR(255) NOT NULL,
  social_name         VARCHAR(255), -- Nome social
  birth_date          DATE NOT NULL,
  gender              VARCHAR(20), -- MASCULINO, FEMININO, OUTRO
  marital_status      VARCHAR(20), -- SOLTEIRO, CASADO, DIVORCIADO, VIUVO
  nationality         VARCHAR(100) DEFAULT 'Brasileira',
  
  -- Contato
  email               VARCHAR(255),
  phone               VARCHAR(20),
  phone_secondary     VARCHAR(20),
  
  -- Endereço
  address_street      VARCHAR(255),
  address_number      VARCHAR(20),
  address_complement  VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city        VARCHAR(100),
  address_state       VARCHAR(2),
  address_zip         VARCHAR(10),
  
  -- Dados Bancários
  bank_name           VARCHAR(100),
  bank_agency         VARCHAR(20),
  bank_account        VARCHAR(20),
  bank_account_type   VARCHAR(20), -- CORRENTE, POUPANCA
  bank_pix            VARCHAR(255),
  
  -- PIS/PASEP
  pis_pasep           VARCHAR(20),
  
  -- CTPS
  ctps_number         VARCHAR(20),
  ctps_series         VARCHAR(20),
  ctps_state          VARCHAR(2),
  
  -- Foto
  photo_url           VARCHAR(500),
  
  -- Status
  status              VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, AFASTADO, DEMITIDO, FERIAS
  admission_date      DATE NOT NULL,
  resignation_date    DATE,
  resignation_reason  TEXT,
  
  -- Controle
  company_id          UUID REFERENCES companies(id),
  department_id       UUID REFERENCES departments(id),
  
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),
  deleted_at          TIMESTAMP
);
```

### Tabela: `employee_documents`
```sql
CREATE TABLE employee_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL, -- CPF, RG, CTPS, COMPROVANTE_RESIDENCIA, etc.
  name        VARCHAR(255) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_size   INTEGER,
  expiry_date DATE,
  is_valid    BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `employee_dependents`
```sql
CREATE TABLE employee_dependents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  full_name   VARCHAR(255) NOT NULL,
  cpf         VARCHAR(14),
  birth_date  DATE,
  relationship VARCHAR(50) NOT NULL, -- CONJUGE, FILHO, FILHA, PAI, MAE
  is_dependent BOOLEAN DEFAULT false, -- IR/SF
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `employee.uniforms`
```sql
CREATE TABLE employee_uniforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  uniform_id  UUID REFERENCES uniforms(id),
  size        VARCHAR(10) NOT NULL,
  quantity    INTEGER DEFAULT 1,
  delivered_at TIMESTAMP,
  returned_at  TIMESTAMP,
  status      VARCHAR(20) DEFAULT 'ENTREGUE', -- ENTREGUE, DEVOLVIDO, TROCA
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Enum Prisma:
```prisma
enum EmployeeStatus {
  ATIVO
  AFASTADO
  DEMITIDO
  FERIAS
}
```

---

## 3. Módulo de Contratos & Postos

### Tabela: `companies` (Empresas do Grupo)
```sql
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL, -- Spark Vigilância, Uniforce, Cratos
  cnpj        VARCHAR(18) UNIQUE NOT NULL,
  trade_name  VARCHAR(255), -- Nome fantasia
  address     TEXT,
  phone       VARCHAR(20),
  email       VARCHAR(255),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `clients` (Clientes que contratam serviços)
```sql
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  cnpj_cpf    VARCHAR(18) NOT NULL,
  type        VARCHAR(20) NOT NULL, -- JURIDICA, FISICA
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  address     TEXT,
  city        VARCHAR(100),
  state       VARCHAR(2),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  deleted_at  TIMESTAMP
);
```

### Tabela: `contracts` (Contratos com Clientes)
```sql
CREATE TABLE contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(30) UNIQUE NOT NULL, -- Número do contrato
  client_id       UUID REFERENCES clients(id),
  company_id      UUID REFERENCES companies(id), -- Qual empresa do grupo fatura
  
  -- Valores
  monthly_value   DECIMAL(12,2), -- Valor mensal do contrato
  hourly_value    DECIMAL(8,2),  -- Valor da hora (se aplicável)
  
  -- Vigência
  start_date      DATE NOT NULL,
  end_date        DATE, -- NULL = vigência indeterminada
  renewal_date    DATE,
  
  -- Configurações
  payment_day     INTEGER, -- Dia do vencimento
  payment_method  VARCHAR(50), -- BOLETO, PIX, TRANSFERENCIA
  billing_cycle   VARCHAR(20) DEFAULT 'MENSAL', -- MENSAL, QUINZENAL, SEMANAL
  
  -- Status
  status          VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, SUSPENSO, ENCERRADO, EM_RENOVACAO
  
  -- Documentos
  notes           TEXT,
  attachment_url  VARCHAR(500),
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP
);
```

### Tabela: `work_posts` (Postos de Trabalho)
```sql
CREATE TABLE work_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(20) UNIQUE NOT NULL, -- Código do posto (ex: POSTO-001)
  name            VARCHAR(255) NOT NULL, -- Nome do posto (ex: "Edifício Central - Portaria Principal")
  description     TEXT,
  
  -- Localização
  address         TEXT NOT NULL,
  city            VARCHAR(100),
  state           VARCHAR(2),
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  
  -- Configuração
  post_type       VARCHAR(50) NOT NULL, -- VIGILANCIA, PORTARIA, RONDA, MONITORAMENTO, LIMPEZA, JARDINAGEM
  schedule_type   VARCHAR(20) DEFAULT 'ROTATIVO', -- FIXO, ROTATIVO, MISTO
  
  -- Contrato
  contract_id     UUID REFERENCES contracts(id),
  company_id      UUID REFERENCES companies(id),
  
  -- Equipe
  supervisor_id   UUID REFERENCES employees(id),
  min_staff       INTEGER DEFAULT 1, -- Mínimo de funcionários
  max_staff       INTEGER DEFAULT 5, -- Máximo de funcionários
  
  -- Configurações de ponto
  gps_latitude    DECIMAL(10,8),
  gps_longitude   DECIMAL(11,8),
  gps_radius      INTEGER DEFAULT 100, -- Raio em metros para marcação de ponto
  
  -- Status
  status          VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, EM_MANUTENCAO
  
  -- Valor cobrado (para controle de custo)
  monthly_cost    DECIMAL(12,2), -- Custo mensal do posto (folha + encargos)
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP
);
```

### Tabela: `post_schedules` (Escalas Padrão do Posto)
```sql
CREATE TABLE post_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES work_posts(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL, -- "Escala 12x36", "Escala 6x1", etc.
  description TEXT,
  
  -- Configuração da escala
  pattern     JSONB NOT NULL, -- Array de turnos [{day: 0, start: "18:00", end: "06:00"}, ...]
  cycle_days  INTEGER NOT NULL, -- Dias do ciclo (ex: 36 para 12x36)
  
  -- Horários por turno
  shifts      JSONB NOT NULL, -- [{name: "MANHA", start: "06:00", end: "18:00"}, ...]
  
  is_default  BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Enum Prisma:
```prisma
enum ContractStatus {
  ATIVO
  SUSPENSO
  ENCERRADO
  EM_RENOVACAO
}

enum PostType {
  VIGILANCIA
  PORTARIA
  RONDA
  MONITORAMENTO
  LIMPEZA
  JARDINAGEM
  INSPECAO
  FISCAL_LOJA
}

enum ScheduleType {
  FIXO
  ROTATIVO
  MISTO
}
```

---

## 4. Módulo de Escalas & Alocação

### Tabela: `assignments` (Alocação de Colaborador ao Posto)
```sql
CREATE TABLE assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID REFERENCES employees(id),
  post_id      UUID REFERENCES work_posts(id),
  schedule_id  UUID REFERENCES post_schedules(id),
  
  start_date   DATE NOT NULL,
  end_date     DATE, -- NULL = até hoje
  
  shift        VARCHAR(20), -- MANHA, TARDE, NOITE, INTEIRO
  position     VARCHAR(100), -- Função no posto (Vigilante, Porteiro, Supervisor)
  
  -- Valores específicos da alocação
  base_salary  DECIMAL(10,2), -- Salário base para este posto
  additional   DECIMAL(10,2) DEFAULT 0, -- Adicionais (periculosidade, insalubridade)
  
  status       VARCHAR(20) DEFAULT 'ATIVA', -- ATIVA, SUSPENSA, ENCERRADA
  
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `generated_schedules` (Escalas Geradas)
```sql
CREATE TABLE generated_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID REFERENCES work_posts(id),
  employee_id   UUID REFERENCES employees(id),
  
  schedule_date DATE NOT NULL,
  shift_name    VARCHAR(50) NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  
  -- Status da escala
  status        VARCHAR(20) DEFAULT 'PROGRAMADO', -- PROGRAMADO, TRABALHADO, FALTA, FERIAS, AFASTADO
  
  -- Marcação de ponto vinculada
  time_clock_id UUID REFERENCES time_clocks(id),
  
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(post_id, employee_id, schedule_date)
);
```

---

## 5. Módulo de Ponto & Espelho

### Tabela: `time_clocks` (Marcações de Ponto)
```sql
CREATE TABLE time_clocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  post_id         UUID REFERENCES work_posts(id),
  
  -- Marcação
  clock_type      VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA, ALMOCO_SAIDA, ALMOCO_RETORNO
  clock_time      TIMESTAMP NOT NULL,
  
  -- Localização (para app mobile)
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  gps_accuracy    DECIMAL(5,2),
  
  -- Autenticação
  auth_method     VARCHAR(20), -- BIOMETRIA, FACIAL, SENHA, GPS
  photo_url       VARCHAR(500), -- Foto no momento da marcação
  
  -- Status
  status          VARCHAR(20) DEFAULT 'VALIDO', -- VALIDO, IRREGULAR, JUSTIFICADO
  irregularity    TEXT, -- Motivo da irregularidade
  justification   TEXT, -- Justificativa do colaborador
  
  -- Aprovação
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMP,
  
  -- Origem
  source          VARCHAR(20) DEFAULT 'WEB', -- WEB, MOBILE, REP (relógio de ponto)
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `time_clock_adjustments` (Ajustes de Ponto)
```sql
CREATE TABLE time_clock_adjustments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_clock_id UUID REFERENCES time_clocks(id),
  adjusted_by   UUID REFERENCES users(id),
  
  old_clock_time TIMESTAMP,
  new_clock_time TIMESTAMP NOT NULL,
  reason        TEXT NOT NULL,
  
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `time_sheets` (Espelho de Ponto / Folha de Ponto)
```sql
CREATE TABLE time_sheets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID REFERENCES employees(id),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  
  -- Resumo do período
  total_worked_hours    DECIMAL(6,2) DEFAULT 0, -- Horas trabalhadas
  total_overtime_hours  DECIMAL(6,2) DEFAULT 0, -- Horas extras
  total_night_hours     DECIMAL(6,2) DEFAULT 0, -- Adicional noturno
  total_absence_days    DECIMAL(4,2) DEFAULT 0, -- Dias de falta
  total_justified_days  DECIMAL(4,2) DEFAULT 0, -- Dias justificados
  
  -- Cálculos financeiros
  overtime_value    DECIMAL(10,2) DEFAULT 0, -- Valor HE
  night_add_value   DECIMAL(10,2) DEFAULT 0, -- Valor adicional noturno
  
  -- Status
  status            VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, CALCULADO, APROVADO, PAGO
  calculated_at     TIMESTAMP,
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMP,
  
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, period_start, period_end)
);
```

### Enum Prisma:
```prisma
enum ClockType {
  ENTRADA
  SAIDA
  ALMOCO_SAIDA
  ALMOCO_RETORNO
}

enum ClockSource {
  WEB
  MOBILE
  REP
}

enum TimeSheetStatus {
  PENDENTE
  CALCULADO
  APROVADO
  PAGO
}
```

---

## 6. Módulo de Folha de Pagamento

### Tabela: `payroll_periods` (Períodos da Folha)
```sql
CREATE TABLE payroll_periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_month INTEGER NOT NULL, -- 1-12
  reference_year  INTEGER NOT NULL,
  type          VARCHAR(20) NOT NULL, -- ADIANTAMENTO, FECHAMENTO
  
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  
  status        VARCHAR(20) DEFAULT 'ABERTO', -- ABERTO, CALCULANDO, CALCULADO, APROVADO, PAGO
  processed_at  TIMESTAMP,
  
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(reference_month, reference_year, type)
);
```

### Tabela: `payrolls` (Registro de Folha por Colaborador)
```sql
CREATE TABLE payrolls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id       UUID REFERENCES payroll_periods(id),
  employee_id     UUID REFERENCES employees(id),
  
  -- Proventos
  base_salary       DECIMAL(10,2) NOT NULL,
  overtime_hours    DECIMAL(6,2) DEFAULT 0,
  overtime_value    DECIMAL(10,2) DEFAULT 0,
  night_hours       DECIMAL(6,2) DEFAULT 0,
  night_add_value   DECIMAL(10,2) DEFAULT 0,
  hazardous_pay     DECIMAL(10,2) DEFAULT 0, -- Periculosidade
  unhealthy_pay     DECIMAL(10,2) DEFAULT 0, -- Insalubridade
  other_additions   DECIMAL(10,2) DEFAULT 0,
  
  -- Descontos
  inss_deduction    DECIMAL(10,2) DEFAULT 0,
  irrf_deduction    DECIMAL(10,2) DEFAULT 0,
  fsf_deduction     DECIMAL(10,2) DEFAULT 0, -- Salário Família
  VT_deduction      DECIMAL(10,2) DEFAULT 0, -- Vale Transporte
  VR_deduction      DECIMAL(10,2) DEFAULT 0, -- Vale Refeição
  health_plan       DECIMAL(10,2) DEFAULT 0, -- Plano de Saúde
  dental_plan       DECIMAL(10,2) DEFAULT 0, -- Plano Odontológico
  other_deductions  DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0, -- Adiantamento
  
  -- Totais
  gross_total     DECIMAL(10,2) DEFAULT 0,
  deductions_total DECIMAL(10,2) DEFAULT 0,
  net_total       DECIMAL(10,2) DEFAULT 0,
  
  -- Informações trabalhistas
  fgts_base       DECIMAL(10,2) DEFAULT 0,
  fgts_value      DECIMAL(10,2) DEFAULT 0,
  inss_base       DECIMAL(10,2) DEFAULT 0,
  irrf_base       DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status          VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, CALCULADO, APROVADO, PAGO
  payment_date    DATE,
  payment_method  VARCHAR(50),
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(period_id, employee_id)
);
```

### Tabela: `payroll_benefits` (Benefícios por Colaborador)
```sql
CREATE TABLE payroll_benefits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id      UUID REFERENCES payrolls(id) ON DELETE CASCADE,
  benefit_type    VARCHAR(50) NOT NULL, -- VT, VR, VC, SAUDE, ODONTO, CRECHE, OUTROS
  description     VARCHAR(255),
  amount          DECIMAL(10,2) NOT NULL,
  quantity        DECIMAL(6,2) DEFAULT 1,
  total           DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `overtime_config` (Configuração de Horas Extras por Escala)
```sql
CREATE TABLE overtime_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Escopo (um deve ser preenchido)
  contract_id       UUID REFERENCES contracts(id),
  post_id           UUID REFERENCES work_posts(id),
  
  -- Regras
  fixed_value       DECIMAL(10,2) NOT NULL, -- Valor fixo por escala extra
  max_per_month     INTEGER DEFAULT 3, -- Limite de escalas extras por mês (NULL = sem limite)
  
  -- Tipo de pagamento
  payment_type      VARCHAR(20) NOT NULL, -- 'PAYSLIP' (vigilantes - no holerite) ou 'SEPARATE' (porteiros - separado)
  
  -- Status
  is_active         BOOLEAN DEFAULT true,
  
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_overtime_config_contract ON overtime_config(contract_id);
CREATE INDEX idx_overtime_config_post ON overtime_config(post_id);
```

### Enum Prisma:
```prisma
enum PayrollType {
  ADIANTAMENTO
  FECHAMENTO
}

enum PayrollPeriodStatus {
  ABERTO
  CALCULANDO
  CALCULADO
  APROVADO
  PAGO
}

enum PayrollStatus {
  PENDENTE
  CALCULADO
  APROVADO
  PAGO
}

enum BenefitType {
  VT
  VR
  VC
  SAUDE
  ODONTO
  CRECHE
  OUTROS
}

enum PaymentType {
  PAYSLIP    -- No holerite (vigilantes)
  SEPARATE   -- Pagamento separado (porteiros)
}
```

---

## 7. Módulos Complementares

### Tabela: `trainings` (Treinamentos/Cursos)
```sql
CREATE TABLE trainings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID REFERENCES employees(id),
  
  name          VARCHAR(255) NOT NULL, -- "NR-10 Segurança", "Reciclagem SENAI", etc.
  category      VARCHAR(50) NOT NULL, -- NR, RECICLAGEM, CAPACITACAO, OUTROS
  provider      VARCHAR(255), --ornecedor do treinamento
  workload      INTEGER, -- Carga horária em horas
  
  start_date    DATE NOT NULL,
  end_date      DATE,
  expiry_date   DATE, -- Data de validade (ex: reciclage a cada 2 anos)
  
  certificate_number VARCHAR(100),
  certificate_url    VARCHAR(500),
  
  status        VARCHAR(20) DEFAULT 'CONCLUIDO', -- EM_ANDAMENTO, CONCLUIDO, VENCIDO, CANCELADO
  
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `asos` (Atestados de Saúde Ocupacional)
```sql
CREATE TABLE asos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  
  type            VARCHAR(50) NOT NULL, -- ADMISSIONAL, DEMISSIONAL, PERIODICO, RETORNO_TRABALHO, MUDANCA_FUNCAO
  exam_date       DATE NOT NULL,
  expiry_date     DATE,
  
  doctor_name     VARCHAR(255),
  doctor_crm      VARCHAR(20),
  clinic_name     VARCHAR(255),
  
  result          VARCHAR(20) NOT NULL, -- APTO, INAPTO
  restrictions    TEXT, -- Restrições médicas
  
  document_url    VARCHAR(500),
  
  status          VARCHAR(20) DEFAULT 'VALIDO', -- VALIDO, VENCIDO, VENCENDO
  is_mandatory    BOOLEAN DEFAULT true,
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `uniforms` (Uniformes/EPIs)
```sql
CREATE TABLE uniforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL, -- "Calça Social", "Camisa Spark", "Botina de Segurança"
  category    VARCHAR(50) NOT NULL, -- UNIFORME, EPI, CALCADOS, ACESSORIOS
  size_options JSONB, -- ["P", "M", "G", "GG", "XG"]
  unit_cost   DECIMAL(8,2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock   INTEGER DEFAULT 10,
  supplier    VARCHAR(255),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `vehicles` (Veículos da Frota)
```sql
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate           VARCHAR(10) UNIQUE NOT NULL,
  model           VARCHAR(100) NOT NULL,
  brand           VARCHAR(100),
  year            INTEGER,
  color           VARCHAR(50),
  type            VARCHAR(50), -- CARRO, MOTO, UTILITARIO, CAMINHONETE
  
  fuel_type       VARCHAR(20), -- GASOLINA, ETANOL, DIESEL, FLEX, ELETRICO
  mileage         INTEGER,
  
  insurance_expiry DATE,
  license_expiry   DATE,
  ipva_expiry      DATE,
  
  status          VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, EM_MANUTENCAO, INATIVO
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP
);
```

### Tabela: `drivers` (Motoristas)
```sql
CREATE TABLE drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  
  cnh_number      VARCHAR(20) NOT NULL,
  cnh_category    VARCHAR(5) NOT NULL, -- A, B, C, D, E
  cnh_expiry      DATE NOT NULL,
  
  cfc_name        VARCHAR(255), -- Centro de Formação de Condutores
  cfc_validity    DATE,
  
  vehicle_id      UUID REFERENCES vehicles(id),
  
  status          VARCHAR(20) DEFAULT 'ATIVO',
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `occurrences` (Ocorrências nos Postos)
```sql
CREATE TABLE occurrences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES work_posts(id),
  employee_id     UUID REFERENCES employees(id), -- Quem reportou
  
  type            VARCHAR(50) NOT NULL, -- ROUBO, INCENDIO, VAZAMENTO, ELETRICIDADE, INVASAO, OUTROS
  severity        VARCHAR(20) NOT NULL, -- BAIXA, MEDIA, ALTA, CRITICA
  
  description     TEXT NOT NULL,
  actions_taken   TEXT, -- Ações tomadas
  photo_urls      JSONB, -- Array de fotos
  
  occurred_at     TIMESTAMP NOT NULL,
  reported_at     TIMESTAMP DEFAULT NOW(),
  
  status          VARCHAR(20) DEFAULT 'ABERTA', -- ABERTA, EM_ANDAMENTO, RESOLVIDA, CANCELADA
  resolved_at     TIMESTAMP,
  resolved_by     UUID REFERENCES users(id),
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `vacations` (Férias)
```sql
CREATE TABLE vacations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  
  -- Período aquisitivo
  acquisition_start DATE NOT NULL, -- Início do período aquisitivo
  acquisition_end   DATE NOT NULL, -- Fim do período aquisitivo
  
  -- Férias
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  days            INTEGER NOT NULL, -- Dias gozados
  
  -- Valores
  salary_base     DECIMAL(10,2),
  third_salary     DECIMAL(10,2), -- 1/3 de férias
  abono_pecuniario BOOLEAN DEFAULT false, -- Venda de 10 dias
  
  status          VARCHAR(20) DEFAULT 'PROGRAMADA', -- PROGRAMADA, EM_GOZO, GOZADA, CANCELADA
  approved_by     UUID REFERENCES users(id),
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `leaves` (Afastamentos/Licenças)
```sql
CREATE TABLE leaves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  
  type            VARCHAR(50) NOT NULL, -- MEDICO, MATERNIDADE, PATERNIDADE, INSS, ATESTADO, OUTROS
  start_date      DATE NOT NULL,
  end_date        DATE,
  
  reason          TEXT,
  document_url    VARCHAR(500),
  
  paid            BOOLEAN DEFAULT true,
  
  status          VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, ENCERRADO
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Enum Prisma:
```prisma
enum TrainingCategory {
  NR
  RECICLAGEM
  CAPACITACAO
  OUTROS
}

enum ASOType {
  ADMISSIONAL
  DEMISSIONAL
  PERIODICO
  RETORNO_TRABALHO
  MUDANCA_FUNCAO
}

enum ASOResult {
  APTO
  INAPTO
}

enum LeaveType {
  MEDICO
  MATERNIDADE
  PATERNIDADE
  INSS
  ATESTADO
  OUTROS
}

enum OccurrenceType {
  ROUBO
  INCENDIO
  VAZAMENTO
  ELETRICIDADE
  INVASAO
  OUTROS
}

enum OccurrenceSeverity {
  BAIXA
  MEDIA
  ALTA
  CRITICA
}
```

---

## 8. Módulo de BI (Indicadores)

### Tabela: `bi_metrics` (Métricas Pré-calculadas)
```sql
CREATE TABLE bi_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type     VARCHAR(50) NOT NULL, -- TURNOVER, ABSENTISMO, CUSTO_POSTO, HORAS_EXTRAS
  entity_type     VARCHAR(50) NOT NULL, -- EMPLOYEE, POST, CONTRACT, DEPARTMENT
  entity_id       UUID NOT NULL,
  
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  
  value           DECIMAL(12,2) NOT NULL,
  metadata        JSONB, -- Dados extras do cálculo
  
  calculated_at   TIMESTAMP DEFAULT NOW(),
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `reports` (Relatórios Gerados)
```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(50) NOT NULL, -- PAYROLL, TIMECLOCK, TURNOVER, COST_CENTER, CUSTOM
  
  parameters      JSONB, -- Filtros usados na geração
  file_url        VARCHAR(500),
  file_format     VARCHAR(10), -- PDF, XLSX, CSV
  
  status          VARCHAR(20) DEFAULT 'GERANDO', -- GERANDO, CONCLUIDO, ERRO
  
  generated_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Índices Recomendados

```sql
-- Performance para consultas frequentes
CREATE INDEX idx_employees_cpf ON employees(cpf);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);

CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);

CREATE INDEX idx_work_posts_contract ON work_posts(contract_id);
CREATE INDEX idx_work_posts_type ON work_posts(post_type);

CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_post ON assignments(post_id);
CREATE INDEX idx_assignments_dates ON assignments(start_date, end_date);

CREATE INDEX idx_time_clocks_employee ON time_clocks(employee_id);
CREATE INDEX idx_time_clocks_date ON time_clocks(clock_time);
CREATE INDEX idx_time_clocks_post ON time_clocks(post_id);

CREATE INDEX idx_time_sheets_employee ON time_sheets(employee_id);
CREATE INDEX idx_time_sheets_period ON time_sheets(period_start, period_end);

CREATE INDEX idx_payrolls_period ON payrolls(period_id);
CREATE INDEX idx_payrolls_employee ON payrolls(employee_id);

CREATE INDEX idx_trainings_employee ON trainings(employee_id);
CREATE INDEX idx_trainings_expiry ON trainings(expiry_date);

CREATE INDEX idx_asos_employee ON asos(employee_id);
CREATE INDEX idx_asos_expiry ON asos(expiry_date);

CREATE INDEX idx_occurrences_post ON occurrences(post_id);
CREATE INDEX idx_occurrences_date ON occurrences(occurred_at);

CREATE INDEX idx_bi_metrics_entity ON bi_metrics(entity_type, entity_id);
CREATE INDEX idx_bi_metrics_period ON bi_metrics(period_start, period_end);
```

---

## 10. Scripts de Seed (Dados Iniciais)

```sql
-- Empresas do Grupo
INSERT INTO companies (id, name, cnpj, trade_name) VALUES
  ('uuid-spark', 'Spark Vigilância e Segurança', 'XX.XXX.XXX/0001-XX', 'Spark Vigilância'),
  ('uuid-uniforce', 'Uniforce Serviços', 'XX.XXX.XXX/0001-XX', 'Uniforce'),
  ('uuid-cratos', 'Cratos Inspeções', 'XX.XXX.XXX/0001-XX', 'Cratos');

-- Roles do sistema
-- (Gerenciado pelo Prisma seed)

-- Usuário admin inicial
INSERT INTO users (id, email, password_hash, role) VALUES
  ('uuid-admin', 'admin@spark.com.br', '$2b$10$...', 'ADMIN');
```

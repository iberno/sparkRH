# SPEC - Módulo 08: Pagamento de Horas Extras Separado (Porteiros)

> **⚠️ Este módulo é EXCLUSIVO para porteiros.**
> 
> Vigilantes pagam HE de escala extra **dentro do holerite normal**, com encargos trabalhistas (INSS, IRRF, FGTS), conforme regra do módulo de Folha de Pagamento (`06-MODULO-PAYROLL.md`).
> 
> | Colaborador | Forma de Pagamento | Encargos |
> |-------------|-------------------|----------|
> | **Vigilantes** | No holerite | Sim (INSS, IRRF, FGTS) |
> | **Porteiros** | Depósito separado | Não |

## 1. Visão Geral

Módulo específico para gestão e pagamento de **Horas Extras de escala extra** trabalhadas por porteiros, que **NÃO entram no holerite** e são pagas de forma separada via depósito em conta, sem encargos trabalhistas.

---

## 2. Contexto e Regra de Negócio

### 2.1 O que são HE de Escala Extra?

São horas trabalhadas fora da escala regular do posto, quando o porteiros é chamado para cobrir turnos adicionais. Essas horas têm pagamento específico e **não integram a folha de pagamento mensal**.

### 2.2 Regra de Pagamento Quinzenal

```
MÊS DE REFERÊNCIA: Julho/2026

┌─────────────────────────────────────────────────────────────────┐
│  PERÍODO 1 (P1): Dias 1 a 20 do mês                            │
│  ─────────────────────────────────────────────────────────────  │
│  HE trabalhadas neste período                                   │
│  💰 PAGAMENTO: Dia 20 do mês seguinte (20/08/2026)             │
│  📅 Atraso: 30 dias                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PERÍODO 2 (P2): Dias 21 a último dia do mês                   │
│  ─────────────────────────────────────────────────────────────  │
│  HE trabalhadas neste período                                   │
│  💰 PAGAMENTO: Dia 20 do mês seguinte ao período 1 (20/09/2026)│
│  📅 Atraso: 60 dias                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Calendário de Exemplo

```
         Julho/2026
Dom  Seg  Ter  Qua  Qui  Sex  Sáb
              1    2    3    4
 5    6    7    8    9   10   11
12   13   14   15   16   17   18
19   20   21   22   23   24   25
26   27   28   29   30   31

     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← P1: Dias 1-20
           ░░░░░░░░░░░░░░░░░  ← P2: Dias 21-31

         Agosto/2026
  💰 20/08 → Pagamento HE do P1 (dias 1-20 de Jul)

         Setembro/2026
  💰 20/09 → Pagamento HE do P2 (dias 21-31 de Jul)
```

### 2.4 Características do Pagamento

| Característica | Descrição |
|---------------|-----------|
| **Vínculo com folha** | ❌ NÃO integra o holerite |
| **Encargos trabalhistas** | ❌ Sem INSS, FGTS, IRRF |
| **Forma de pagamento** | Depósito em conta bancária |
| **Visibilidade** | Apenas DP/RH (web) - não aparece no app do colaborador |
| **Aprovação** | Supervisor do posto + DP/RH |
| **Recibo** | PDF gerado automaticamente (sem vínculo com holerite) |
| **Cálculo** | Salário base ÷ 220 × horas extras × adicional (50% ou 100%) |

---

## 3. Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DO MÓDULO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │ 1. CAPTURA   │ Espelho de ponto dos porteiros é processado  │
│  │    DADOS     │ (módulo de Ponto & Espelho)                   │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 2. SEPARAÇÃO │ Sistema identifica HE de escala extra         │
│  │    QUINZENAL │ e separa por período:                         │
│  │              │ • P1 (dia 1-20) → Pagamento em 20/mês+1      │
│  │              │ • P2 (dia 21-31) → Pagamento em 20/mês+2     │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 3. CÁLCULO   │ Para cada porteiros:                          │
│  │              │ HE = (Salário Base ÷ 220) × Horas × Adicional │
│  │              │ Adicional: 50% (normal) ou 100% (domingo/fer) │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 4. APROVAÇÃO │ Supervisor revisa e aprova                    │
│  │              │ DP/RH revisa e aprova                          │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 5. RECIBO    │ Gera PDF do recibo de pagamento               │
│  │              │ (dados do porteiros, período, valor, data)    │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 6. PAGAMENTO │ Gera arquivo de depósito bancário             │
│  │              │ (CNAB ou manual)                               │
│  │              │ Data: 20/mês conforme período                 │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ 7. BAIXA     │ Registra pagamento como PAGO                  │
│  │              │ Gera log de auditoria                          │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Dados

### Tabela: `extra_payroll` (Pagamento de HE Separado)

```sql
CREATE TABLE extra_payroll (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  employee_id       UUID REFERENCES employees(id) NOT NULL,
  post_id           UUID REFERENCES work_posts(id) NOT NULL,
  
  -- Período de referência (mês em que as HE foram trabalhadas)
  reference_month   INTEGER NOT NULL, -- 1-12
  reference_year    INTEGER NOT NULL,
  period            VARCHAR(2) NOT NULL, -- 'P1' (dia 1-20) ou 'P2' (dia 21-31)
  
  -- Detalhamento do período
  period_start      DATE NOT NULL, -- Data início do período (ex: 01/07/2026)
  period_end        DATE NOT NULL, -- Data fim do período (ex: 20/07/2026)
  
  -- Cálculo das HE
  overtime_hours_50   DECIMAL(6,2) DEFAULT 0, -- HE a 50% (dias úteis)
  overtime_hours_100  DECIMAL(6,2) DEFAULT 0, -- HE a 100% (domingos/feriados)
  total_hours         DECIMAL(6,2) DEFAULT 0, -- Total de horas
  
  -- Valores
  hourly_value        DECIMAL(8,2) NOT NULL, -- Valor da hora extra
  value_50            DECIMAL(10,2) DEFAULT 0, -- Valor HE 50%
  value_100           DECIMAL(10,2) DEFAULT 0, -- Valor HE 100%
  gross_value         DECIMAL(10,2) NOT NULL, -- Valor bruto total
  
  -- Pagamento
  payment_date        DATE NOT NULL, -- Data prevista: 20/mês+1 (P1) ou 20/mês+2 (P2)
  payment_method      VARCHAR(20) DEFAULT 'DEPOSITO', -- DEPOSITO, PIX
  payment_status      VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, AGENDADO, PAGO, CANCELADO
  paid_at             TIMESTAMP,
  payment_proof       VARCHAR(500), -- Comprovante de depósito (URL do arquivo)
  
  -- Aprovação
  status              VARCHAR(20) DEFAULT 'CALCULADO', -- CALCULADO, APROVADO_SUPERVISOR, APROVADO_DP, PAGO, CANCELADO
  supervisor_id       UUID REFERENCES users(id),
  supervisor_approved_at TIMESTAMP,
  dp_rh_id            UUID REFERENCES users(id),
  dp_rh_approved_at   TIMESTAMP,
  
  -- Observações
  notes               TEXT,
  
  -- Auditoria
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_extra_payroll_employee ON extra_payroll(employee_id);
CREATE INDEX idx_extra_payroll_period ON extra_payroll(reference_year, reference_month, period);
CREATE INDEX idx_extra_payroll_status ON extra_payroll(payment_status);
CREATE INDEX idx_extra_payroll_payment_date ON extra_payroll(payment_date);
```

### Tabela: `extra_payroll_items` (Detalhamento por dia)

```sql
CREATE TABLE extra_payroll_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_payroll_id  UUID REFERENCES extra_payroll(id) ON DELETE CASCADE,
  
  -- Dados da marcação
  time_clock_id     UUID REFERENCES time_clocks(id),
  work_date         DATE NOT NULL, -- Data que a HE foi trabalhada
  
  -- Horas
  start_time        TIMESTAMP NOT NULL, -- Início da HE
  end_time          TIMESTAMP NOT NULL, -- Fim da HE
  hours_worked      DECIMAL(5,2) NOT NULL, -- Horas trabalhadas
  
  -- Tipo
  overtime_type     VARCHAR(10) NOT NULL, -- '50' ou '100'
  reason            VARCHAR(100), -- Motivo (cobertura, evento, etc.)
  
  -- Valores
  hourly_value      DECIMAL(8,2) NOT NULL,
  total_value       DECIMAL(10,2) NOT NULL,
  
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `extra_payroll_config` (Configurações por Contrato/Posto)

```sql
CREATE TABLE extra_payroll_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Escopo (um deles deve ser preenchido)
  contract_id       UUID REFERENCES contracts(id), -- Config por contrato
  post_id           UUID REFERENCES work_posts(id), -- Config por posto específico
  
  -- Regras de pagamento
  payment_day       INTEGER DEFAULT 20, -- Dia do pagamento (default: 20)
  p1_cutoff_day     INTEGER DEFAULT 20, -- Dia de corte do P1 (default: 20)
  
  -- Cálculo
  hourly_value_type VARCHAR(20) DEFAULT 'SALARY_220', -- SALARY_220 (base ÷ 220) ou FIXED
  fixed_hourly_value DECIMAL(8,2), -- Se type = FIXED
  
  -- Limites
  max_overtime_hours DECIMAL(5,2), -- Limite máximo de HE por período (NULL = sem limite)
  min_rest_hours     DECIMAL(5,2) DEFAULT 12, -- Mínimo de descanso entre turnos
  
  -- Status
  is_active         BOOLEAN DEFAULT true,
  
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### Enum Prisma

```prisma
enum ExtraPayrollPeriod {
  P1  // Dia 1-20
  P2  // Dia 21-31
}

enum ExtraPayrollStatus {
  CALCULADO
  APROVADO_SUPERVISOR
  APROVADO_DP
  PAGO
  CANCELADO
}

enum ExtraPayrollPaymentStatus {
  PENDENTE
  AGENDADO
  PAGO
  CANCELADO
}

enum OvertimeType {
  PERCENT_50   // 50% - dias úteis
  PERCENT_100  // 100% - domingos e feriados
}
```

---

## 5. Regras de Cálculo

### 5.1 Valor da Hora Extra

```
Fórmula padrão:
  hourly_value = Salário Base do Colaborador ÷ 220

Exemplo:
  Salário Base: R$ 3.000,00
  Hourly Value: R$ 3.000,00 ÷ 220 = R$ 13,6363...

Arredondamento: 2 casas decimais → R$ 13,64
```

### 5.2 Cálculo por Tipo

```
HE a 50% (dias úteis):
  value = hourly_value × hours × 1.5

HE a 100% (domingos/feriados):
  value = hourly_value × hours × 2.0

Valor Total:
  gross_value = Σ(value_50) + Σ(value_100)
```

### 5.3 Exemplo Prático

```
Colaborador: João da Silva
Salário Base: R$ 3.000,00
Valor Hora: R$ 3.000 ÷ 220 = R$ 13,64

PERÍODO 1 (01/07 a 20/07/2026):
┌──────────┬─────────┬───────┬──────────┬─────────┐
│ Data     │ Tipo    │ Horas │ Adicional│ Valor   │
├──────────┼─────────┼───────┼──────────┼─────────┤
│ 10/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 15/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 18/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 20/07    │ 100%    │ 2h    │ 2,0x     │ R$ 54,55│
├──────────┴─────────┴───────┴──────────┼─────────┤
│                              TOTAL P1 │ R$177,27│
└───────────────────────────────────────┴─────────┘
Pagamento: 20/08/2026

PERÍODO 2 (21/07 a 31/07/2026):
┌──────────┬─────────┬───────┬──────────┬─────────┐
│ Data     │ Tipo    │ Horas │ Adicional│ Valor   │
├──────────┼─────────┼───────┼──────────┼─────────┤
│ 22/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 25/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 28/07    │ 50%     │ 2h    │ 1,5x     │ R$ 40,91│
│ 30/07    │ 100%    │ 2h    │ 2,0x     │ R$ 54,55│
│ 31/07    │ 100%    │ 2h    │ 2,0x     │ R$ 54,55│
├──────────┴─────────┴───────┴──────────┼─────────┤
│                              TOTAL P2 │ R$231,83│
└───────────────────────────────────────┴─────────┘
Pagamento: 20/09/2026
```

---

## 6. Endpoints da API

### Extra Payroll

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/extra-payroll` | Listar pagamentos (filtros) |
| POST | `/api/v1/extra-payroll/calculate` | Calcular HE separadas do período |
| GET | `/api/v1/extra-payroll/:id` | Buscar pagamento completo |
| PUT | `/api/v1/extra-payroll/:id/approve-supervisor` | Aprovar (supervisor) |
| PUT | `/api/v1/extra-payroll/:id/approve-dp` | Aprovar (DP/RH) |
| POST | `/api/v1/extra-payroll/:id/pay` | Registrar pagamento |
| POST | `/api/v1/extra-payroll/:id/cancel` | Cancelar pagamento |
| GET | `/api/v1/extra-payroll/:id/receipt` | Gerar recibo PDF |
| GET | `/api/v1/extra-payroll/pending` | Pagamentos pendentes |
| GET | `/api/v1/extra-payroll/calendar` | Calendário de pagamentos |
| POST | `/api/v1/extra-payroll/generate-deposit-file` | Gerar arquivo de depósito |
| GET | `/api/v1/extra-payroll/report` | Relatório de HE pagas |

### Configurações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/extra-payroll-config` | Listar configurações |
| POST | `/api/v1/extra-payroll-config` | Criar configuração |
| PUT | `/api/v1/extra-payroll-config/:id` | Atualizar configuração |
| GET | `/api/v1/extra-payroll-config/:id` | Buscar configuração |

### Detalhamento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/extra-payroll/:id/items` | Itens do pagamento |
| POST | `/api/v1/extra-payroll/:id/items` | Adicionar item manual |
| DELETE | `/api/v1/extra-payroll/:id/items/:itemId` | Remover item |

---

## 7. Filtros de Busca

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `employeeId` | UUID | Filtrar por porteiros |
| `postId` | UUID | Filtrar por posto |
| `referenceMonth` | number | Mês de referência |
| `referenceYear` | number | Ano de referência |
| `period` | enum | P1 ou P2 |
| `status` | enum | CALCULADO, APROVADO, PAGO |
| `paymentStatus` | enum | PENDENTE, AGENDADO, PAGO |
| `paymentDateFrom` | date | Pagamento após data |
| `paymentDateTo` | date | Pagamento antes data |

---

## 8. Tela Principal (Web - DP/RH)

```
┌─────────────────────────────────────────────────────────────────┐
│  💰 HE Separado - Porteiros                          [+ Calcular]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mês/Ano: [▼ Julho/2026]   Posto: [▼ Todos]   Status: [▼ Todos]│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RESUMO                                                   │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ Porteiros   │  │ Total HE    │  │ Valor Total │     │   │
│  │  │ com HE      │  │             │  │             │     │   │
│  │  │    15       │  │   200h      │  │ R$ 12.000   │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ P1 Pendente │  │ P1 Pago     │  │ P2 Pendente │     │   │
│  │  │ R$ 4.800    │  │ R$ 4.800    │  │ R$ 7.200    │     │   │
│  │  │ 🟡 20/08    │  │ ✅ 20/08    │  │ 🔵 20/09    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LISTAGEM                                                 │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │                                                           │   │
│  │  Colaborador    │ Posto          │ HE P1  │ HE P2  │ Valor│   │
│  │─────────────────┼────────────────┼────────┼────────┼──────│   │
│  │ 🟢 João da Silva│ Ed. Central    │  8h    │  12h   │R$1.200│  │
│  │ 🟢 Maria Santos │ Shopping VV    │  4h    │   8h   │R$ 720 │  │
│  │ 🟡 Pedro Oliveir│ Empresa XYZ    │  6h    │  10h   │R$ 960 │  │
│  │ ⚪ Ana Costa    │ Cond. ABC      │  2h    │   4h   │R$ 360 │  │
│  │ ⚪ Carlos Ferreir│ Ind. DEF      │  0h    │   6h   │R$ 360 │  │
│  │                                                           │   │
│  │  🟢 = Aprovado  🟡 = Pendente  ⚪ = Sem HE               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Ações:                                                          │
│  [📥 Gerar Recibos PDF]  [💳 Gerar Arquivo Depósito]            │
│  [✅ Aprovar Selecionados]  [❌ Cancelar Selecionados]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Recibo de Pagamento (PDF)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ⚡ SPARK VIGILÂNCIA E SEGURANÇA               │
│                    CNPJ: XX.XXX.XXX/0001-XX                      │
│                    Rua Castelo Branco, 1012 - Vila Velha/ES      │
│                                                                  │
│  ═══════════════════════════════════════════════════════════════ │
│                    RECIBO DE PAGAMENTO DE HORAS EXTRAS           │
│                    (Pagamento Separado - Não integra Holerite)   │
│  ═══════════════════════════════════════════════════════════════ │
│                                                                  │
│  Colaborador: João da Silva                                      │
│  CPF: XXX.XXX.XXX-XX                                             │
│  Matrícula: 2026SPK0001                                          │
│  Função: Porteiro                                                │
│  Posto: Edifício Central - Portaria                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│  REFERÊNCIA: Julho/2026 - Período 1 (01/07 a 20/07)            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  Data do Pagamento: 20/08/2026                                   │
│  Forma de Pagamento: Depósito em Conta                           │
│                                                                  │
│  DETALHAMENTO DAS HORAS EXTRAS:                                  │
│  ┌──────────┬────────────┬───────┬──────────┬──────────┐       │
│  │ Data     │ Turno      │ Horas │ Adicional│ Valor    │       │
│  ├──────────┼────────────┼───────┼──────────┼──────────┤       │
│  │ 10/07/26 │ 18:00-20:00│  2h   │ 50%      │ R$ 40,91 │       │
│  │ 15/07/26 │ 18:00-20:00│  2h   │ 50%      │ R$ 40,91 │       │
│  │ 18/07/26 │ 18:00-20:00│  2h   │ 50%      │ R$ 40,91 │       │
│  │ 20/07/26 │ 18:00-20:00│  2h   │ 100%     │ R$ 54,55 │       │
│  ├──────────┴────────────┴───────┴──────────┼──────────┤       │
│  │                               TOTAL      │ R$ 177,27│       │
│  └──────────────────────────────────────────┴──────────┘       │
│                                                                  │
│  VALOR LÍQUIDO PAGO: R$ 177,27                                  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│  Este pagamento é referente a horas extras de escala extra       │
│  e NÃO integra a folha de pagamento mensal.                     │
│  Sem descontos de INSS, FGTS ou IRRF.                           │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  Recebi o valor acima referente ao período indicado.             │
│                                                                  │
│  Vila Velha/ES, ___/___/2026                                     │
│                                                                  │
│  _________________________________                              │
│  João da Silva                                                   │
│  Assinatura do Colaborador                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Arquivo de Depósito Bancário

### 10.1 Layout CNAB240 (Sugestão)

| Campo | Posição | Tamanho | Descrição |
|-------|---------|---------|-----------|
| Código do Banco | 1-3 | 3 | Código do banco destinto |
| Lote | 4-7 | 4 | Código do lote |
| Tipo de Registro | 8 | 1 | "3" (detalhe) |
| Nº Sequencial | 9-14 | 6 | Sequencial do registro |
| Código Segmento | 15 | 1 | "A" |
| Branco | 16-17 | 2 | Espaços |
| Código Movimento | 18-20 | 3 | "000" (inclusão) |
| Agência | 21-24 | 4 | Agência do beneficiário |
| Conta | 25-35 | 11 | Conta do beneficiário |
| Valor | 145-159 | 15 | Valor do depósito (9 int + 6 dec) |
| CPF/CNPJ Favorecido | 218-231 | 14 | CPF do porteiros |

### 10.2 Geração

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ DP/RH clica  │────▶│ Sistema      │────▶│ Gera arquivo │
│ "Gerar Arq.  │     │ agrupa por   │     │ CNAB240      │
│  Depósito"   │     │ banco/agência│     │ (.txt)       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Download do arquivo│
                                        │ para upload no     │
                                        │ internet banking   │
                                        └───────────────────┘
```

---

## 11. Dashboard de Acompanhamento

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Dashboard HE Separado - Porteiros                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mês/Ano: [▼ Julho/2026]                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRÓXIMOS PAGAMENTOS                                      │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │                                                           │   │
│  │  📅 20/08/2026 - P1 Julho                                 │   │
│  │     15 porteiros │ R$ 4.800,00 │ 🟡 Aguardando           │   │
│  │                                                           │   │
│  │  📅 20/09/2026 - P2 Julho                                 │   │
│  │     12 porteiros │ R$ 7.200,00 │ 🔵 Pendente              │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EVOLUÇÃO MENSAL (6 meses)                                │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │                                                           │   │
│  │  R$15k ─┐                                                │   │
│  │         │    ●                                            │   │
│  │  R$12k ─┤  ●   ●                                         │   │
│  │         │        ●  ●                                     │   │
│  │  R$9k  ─┤              ●                                  │   │
│  │         │                                                 │   │
│  │  R$6k  ─┤                                                 │   │
│  │         └──────────────────────────────                   │   │
│  │          Jan Fev Mar Abr Mai Jun Jul                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TOP 5 PORTEIROS COM MAIS HE                              │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │  1. João da Silva      20h    R$ 1.200                   │   │
│  │  2. Maria Santos       12h    R$   720                   │   │
│  │  3. Pedro Oliveira     16h    R$   960                   │   │
│  │  4. Carlos Ferreira    10h    R$   600                   │   │
│  │  5. Ana Costa           6h    R$   360                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Integrações

| Módulo | Integração |
|--------|-----------|
| **Ponto & Espelho** | Leitura automática do espelho aprovado para identificar HE |
| **Colaboradores** | Dados do porteiros (salário base, banco, agência) |
| **Contratos** | Configuração de HE por contrato |
| **Postos** | Identificação do tipo de posto (portaria) |
| **Folha** | ⚠️ NÃO se integra (pagamento separado) |
| **App Mobile** | ⚠️ NÃO exibe dados de HE separado |
| **Agente Spark** | ⚠️ NÃO consulta HE separado |

---

## 13. Regras de Negócio

### 13.1 Quem gera HE separada

| Regra | Descrição |
|-------|-----------|
| **Tipo de posto** | Apenas postos do tipo PORTARIA |
| **Configuração** | Posto deve ter `extra_payroll_config` ativa |
| **Colaborador** | Porteiros alocados no posto |

### 13.2 Separação por período

| Regra | Descrição |
|-------|-----------|
| **P1** | Dias 1 ao dia de corte (default: 20) |
| **P2** | Dia de corte + 1 ao último dia do mês |
| **Dia de corte** | Configurável por contrato (default: 20) |

### 13.3 Datas de pagamento

| Período | Mês Referência | Data Pagamento |
|---------|---------------|----------------|
| P1 | Mês M | 20/mês M+1 |
| P2 | Mês M | 20/mês M+2 |

**Exemplo:**
| HE trabalhadas em | Pagar em |
|-------------------|----------|
| P1 Julho (01-20/07) | 20/08/2026 |
| P2 Julho (21-31/07) | 20/09/2026 |
| P1 Agosto (01-20/08) | 20/09/2026 |
| P2 Agosto (21-31/08) | 20/10/2026 |

### 13.4 Aprovação

| Etapa | Responsável | Prazo |
|-------|-------------|-------|
| 1ª aprovação | Supervisor do posto | Até 5 dias após fechamento do período |
| 2ª aprovação | DP/RH | Até 3 dias após 1ª aprovação |
| Pagamento | Financeiro | No dia previsto (20/mês) |

### 13.5 Cancelamento

- Pode ser cancelado apenas antes do depósito
- Após pagamento: não pode cancelar (gera aditivo)
- Cancelamento gera log de auditoria completo

---

## 14. Roadmap de Expansão

### Fase 1 (MVP)
- [ ] Cálculo automático de HE separada
- [ ] Aprovação supervisor + DP/RH
- [ ] Geração de recibo PDF
- [ ] Dashboard de acompanhamento

### Fase 2
- [ ] Geração de arquivo bancário (CNAB240)
- [ ] Configuração por contrato/posto
- [ ] Histórico de pagamentos
- [ ] Relatórios para auditoria

### Fase 3
- [ ] Regras para vigilantes (quando definidas)
- [ ] Integração com N8N para notificações
- [ ] Alertas automáticos de pagamento
- [ ] Exportação para contabilidade

---

## 15. Vigilantes (Futuro)

> **⚠️ Aguardando definição da regra para vigilantes.**
>
> Quando a regra for definida, poderá ser implementada como:
> - **Opção A**: Mesma regra (P1/P2) com configuração separada
> - **Opção B**: Regra diferente (ex: mensal, com encargos)
> - **Opção C**: Não se aplica (vigilantes pagam HE na folha normal)
>
> A estrutura do módulo já suporta múltiplos tipos de pagamento
> via campo `payment_type` ou tabela de configuração separada.

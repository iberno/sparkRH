# SPEC - Módulo 03: Contratos & Postos de Trabalho

## 1. Visão Geral

Módulo de gestão de contratos com clientes (empresas que contratam serviços de segurança) e postos de trabalho onde os colaboradores são alocados.

---

## 2. Hierarquia de Dados

```
Cliente (empresa contratante)
  └── Contrato (acordo comercial)
        └── Posto(s) de Trabalho (loja, edifício, condomínio, etc.)
              └── Escala(s) padrão do posto
              └── Colaborador(es) alocados
```

**Regra**: 1 contrato = N postos | 1 posto = 1 contrato

---

## 3. Cadastro de Clientes

### 3.1 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Nome / Razão Social | ✅ | |
| CNPJ ou CPF | ✅ | Único no sistema |
| Tipo | ✅ | JURIDICA, FISICA |
| Nome do contato | ✅ | Pessoa responsável |
| Telefone do contato | ✅ | |
| E-mail do contato | ✅ | |
| Endereço | ❌ | |
| Cidade / UF | ❌ | |
| Observações | ❌ | |

### 3.2 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/clients` | Listar clientes (paginado) |
| POST | `/api/v1/clients` | Criar cliente |
| GET | `/api/v1/clients/:id` | Buscar cliente com contratos |
| PUT | `/api/v1/clients/:id` | Atualizar cliente |
| DELETE | `/api/v1/clients/:id` | Desativar cliente |
| GET | `/api/v1/clients/:id/contracts` | Contratos do cliente |

---

## 4. Cadastro de Contratos

### 4.1 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Número do contrato | ✅ | Gerado automaticamente ou informado |
| Cliente | ✅ | Vinculado ao cadastro |
| Empresa do Grupo (faturamento) | ✅ | Spark, Uniforce ou Cratos |
| Valor mensal | ✅ | Valor total do contrato |
| Valor por hora | ❌ | Se cobrado por hora |
| Data de início | ✅ | |
| Data de término | ❌ | NULL = indeterminado |
| Data de renovação | ❌ | Para contratos anuais |
| Dia de pagamento | ✅ | 1-31 |
| Forma de pagamento | ✅ | BOLETO, PIX, TRANSFERENCIA |
| Ciclo de faturamento | ✅ | MENSAL, QUINZENAL, SEMANAL |
| Status | ✅ | ATIVO, SUSPENSO, ENCERRADO, EM_RENOVACAO |
| Observações | ❌ | |
| Anexo (contrato assinado) | ❌ | Upload PDF |

### 4.2 Status do Contrato

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  CRIADO  │────▶│  ATIVO   │────▶│  ENCERRADO   │
│          │     │          │     │              │
└──────────┘     └────┬─────┘     └──────────────┘
                      │
                ┌─────▼──────┐
                │  SUSPENSO  │
                │            │
                └─────┬──────┘
                      │
                ┌─────▼──────────┐
                │ EM_RENOVACAO   │
                │                │
                └────────────────┘
```

### 4.3 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/contracts` | Listar contratos (filtros) |
| POST | `/api/v1/contracts` | Criar contrato |
| GET | `/api/v1/contracts/:id` | Buscar contrato com postos |
| PUT | `/api/v1/contracts/:id` | Atualizar contrato |
| DELETE | `/api/v1/contracts/:id` | Encerrar contrato |
| PUT | `/api/v1/contracts/:id/suspend` | Suspender contrato |
| PUT | `/api/v1/contracts/:id/reactivate` | Reativar contrato |
| GET | `/api/v1/contracts/:id/posts` | Postos do contrato |
| GET | `/api/v1/contracts/:id/cost` | Custo total do contrato (folha + encargos) |

---

## 5. Cadastro de Postos de Trabalho

### 5.1 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Código do posto | ✅ | Único (ex: POSTO-001) |
| Nome | ✅ | Nome do local (ex: "Edifício Central - Portaria") |
| Descrição | ❌ | Detalhes do posto |
| Endereço completo | ✅ | |
| Cidade / UF | ✅ | |
| Coordenadas GPS | ❌ | Para marcação de ponto |
| Raio GPS | ❌ | Default: 100 metros |
| Tipo do posto | ✅ | VIGILANCIA, PORTARIA, RONDA, etc. |
| Tipo de escala | ✅ | FIXO, ROTATIVO, MISTO |
| Contrato vinculado | ✅ | |
| Empresa do grupo | ✅ | |
| Supervisor responsável | ❌ | |
| Mínimo de funcionários | ✅ | Default: 1 |
| Máximo de funcionários | ✅ | Default: 5 |
| Valor mensal do posto | ❌ | Para controle de custo |
| Status | ✅ | ATIVO, INATIVO, EM_MANUTENCAO |

### 5.2 Tipos de Posto

| Tipo | Descrição |
|------|-----------|
| VIGILANCIA | Vigilância patrimonial estática |
| PORTARIA | Controle de acesso |
| RONDA | Rondas motorizadas/pé |
| MONITORAMENTO | Central de monitoramento CFTV |
| LIMPEZA | Serviços de limpeza |
| JARDINAGEM | Manutenção de áreas verdes |
| INSPECAO | Auxiliar de inspeção |
| FISCAL_LOJA | Fiscal de loja |

### 5.3 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/work-posts` | Listar postos (filtros) |
| POST | `/api/v1/work-posts` | Criar posto |
| GET | `/api/v1/work-posts/:id` | Buscar posto completo |
| PUT | `/api/v1/work-posts/:id` | Atualizar posto |
| DELETE | `/api/v1/work-posts/:id` | Desativar posto |
| GET | `/api/v1/work-posts/:id/staff` | Colaboradores alocados |
| GET | `/api/v1/work-posts/:id/schedules` | Escalas do posto |
| GET | `/api/v1/work-posts/:id/cost` | Custo mensal do posto |
| GET | `/api/v1/work-posts/:id/occupancy` | Taxa de ocupação |

---

## 6. Escalas Padrão do Posto

### 6.1 Configuração

Cada posto pode ter múltiplas escalas padrão:

```json
{
  "name": "Escala 12x36",
  "cycle_days": 36,
  "shifts": [
    { "name": "MANHA", "start": "06:00", "end": "18:00" },
    { "name": "NOITE", "start": "18:00", "end": "06:00" }
  ],
  "pattern": [
    { "day": 0, "shift": "MANHA" },
    { "day": 1, "shift": "MANHA" },
    { "day": 2, "shift": null },
    { "day": 3, "shift": "NOITE" },
    { "day": 4, "shift": "NOITE" },
    { "day": 5, "shift": null }
  ]
}
```

### 6.2 Tipos de Escala Comuns

| Escala | Descrição | Ciclo |
|--------|-----------|-------|
| 12x36 | 12h trabalho, 36h descanso | 2 dias |
| 6x1 | 6 dias trabalho, 1 descanso | 7 dias |
| 5x2 | 5 dias trabalho, 2 descanso | 7 dias |
| 4x2 | 4 dias trabalho, 2 descanso | 6 dias |
| Seg-Sex | Segunda a sexta | 5 dias |
| Personalizada | Definida pelo supervisor | Variável |

### 6.3 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/work-posts/:id/post-schedules` | Listar escalas |
| POST | `/api/v1/work-posts/:id/post-schedules` | Criar escala padrão |
| PUT | `/api/v1/post-schedules/:id` | Atualizar escala |
| DELETE | `/api/v1/post-schedules/:id` | Remover escala |
| POST | `/api/v1/post-schedules/:id/generate` | Gerar escala para período |

---

## 7. Alocação de Colaboradores

### 7.1 Regras de Alocação

1. Um colaborador **só pode estar alocado em 1 posto por turno**
2. O colaborador pode ter múltiplas alocações em **turnos diferentes**
3. Verificar conflito de horário antes de alocar
4. Verificar se o posto tem vagas disponíveis
5. Colaborador deve ter documentos válidos (ASO, treinamentos)

### 7.2 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/assignments` | Listar alocações |
| POST | `/api/v1/assignments` | Criar alocação |
| PUT | `/api/v1/assignments/:id` | Atualizar alocação |
| DELETE | `/api/v1/assignments/:id` | Encerrar alocação |
| GET | `/api/v1/assignments/conflicts` | Verificar conflitos |

---

## 8. Filtros de Busca

### Contratos

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `search` | string | Número do contrato, nome do cliente |
| `clientId` | UUID | Filtrar por cliente |
| `companyId` | UUID | Filtrar por empresa do grupo |
| `status` | enum | ATIVO, SUSPENSO, ENCERRADO |
| `startAfter` | date | Início após data |
| `startBefore` | date | Início antes data |
| `expiringInDays` | number | Contratos vencendo em X dias |

### Postos

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `search` | string | Código, nome, endereço |
| `contractId` | UUID | Filtrar por contrato |
| `companyId` | UUID | Filtrar por empresa |
| `type` | enum | Tipo do posto |
| `status` | enum | ATIVO, INATIVO |
| `hasVacancy` | boolean | Postos com vagas disponíveis |

---

## 9. Dashboard do Módulo

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD DE POSTOS                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Total       │  │ Postos      │  │ Postos      │     │
│  │ Contratos   │  │ Ativos      │  │ Inativos    │     │
│  │    45       │  │    120      │  │    8        │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Ocupação    │  │ Colaborad.  │  │ Receita     │     │
│  │ Média       │  │ Alocados    │  │ Mensal      │     │
│  │    85%      │  │    320      │  │ R$ 450mil   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Postos por Tipo                                   │   │
│  │  ████████████ Vigilância (45)                      │   │
│  │  █████████   Portaria (35)                         │   │
│  │  ██████      Ronda (20)                            │   │
│  │  ████        Limpeza (15)                          │   │
│  │  ██          Outros (5)                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Contratos Vencendo (próximos 90 dias)            │   │
│  │  ┌──────┬──────────────┬──────────┬──────────┐   │   │
│  │  │ #    │ Cliente      │ Vence    │ Valor    │   │   │
│  │  ├──────┼──────────────┼──────────┼──────────┤   │   │
│  │  │ 001  │ Empresa X    │ 15/08/26 │ R$ 12mil │   │   │
│  │  │ 002  │ Empresa Y    │ 22/08/26 │ R$ 8mil  │   │   │
│  │  │ 003  │ Empresa Z    │ 01/09/26 │ R$ 25mil │   │   │
│  │  └──────┴──────────────┴──────────┴──────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

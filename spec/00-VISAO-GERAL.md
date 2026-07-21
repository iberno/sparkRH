# SPEC - Spark RH & DP Portal

## Visão Geral do Sistema

### Identidade do Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | Spark RH & DP Portal |
| **Empresa** | Spark Vigilância e Segurança |
| **CNPJ** | Grupo Spark (Spark Vigilância, Uniforce, Cratos) |
| **Localização** | Vila Velha/ES - Brasil |
| **Versão do SPEC** | 1.0.0 |
| **Data** | Julho 2026 |

---

## 1. Contexto e Objetivo

### 1.1 Contexto

A Spark Vigilância e Segurança é um grupo que opera em três empresas do setor de segurança privada:

- **Spark Vigilância e Segurança** — Vigilância patrimonial, escolta armada, segurança pessoal, ronda motorizada, vídeo monitoramento
- **Uniforce** — Portaria, limpeza e conservação, jardinagem, manutenção (Artífice)
- **Cratos** — Auxiliar de inspeção, fiscal de loja

O grupo atende aproximadamente **250 clientes** com **100 a 500 colaboradores** alocados em postos de serviço mistos (fixos e rotativos).

### 1.2 Problema

Atualmente a gestão de RH, DP, escalas, ponto e folha de pagamento é feita de forma fragmentada, gerando:

- Dificuldade de controle de escalas em postos rotativos
- Falta de visão consolidada de custo por cliente/posto
- Controle manual de treinamentos e certificados (NR, ASO)
- Dificuldade de apurar ponto e calcular horas extras
- Falta de indicadores de BI para tomada de decisão

### 1.3 Objetivo

Criar um **sistema web interno** de gestão de RH e DP exclusivo para o segmento de vigilância e segurança privada, com:

- Gestão centralizada de colaboradores, postos e contratos
- Controle de ponto com espelho e cálculo para folha
- Cálculo completo de folha de pagamento (CLT)
- App mobile para marcação de ponto
- Dashboards e relatórios de BI
- Gestão de conformidade (treinamentos, ASOs, EPIs)

---

## 2. Escopo do Sistema

### 2.1 Módulos Principais

| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | **Autenticação & Acesso** | Login, perfis, permissões por módulo |
| 2 | **Gestão de Colaboradores** | Cadastro completo do funcionário CLT |
| 3 | **Contratos & Postos** | Gestão de contratos com clientes e postos de serviço |
| 4 | **Escalas de Trabalho** | Montagem e gerenciamento de escalas por posto |
| 5 | **Ponto & Espelho** | Marcação de ponto, espelho, cálculo de horas |
| 6 | **Folha de Pagamento** | Cálculo completo CLT (adiantamento + fechamento) |
| 7 | **Treinamentos** | Controle de certificados, NR, reciclagens |
| 8 | **ASO & Saúde** | Controle de ASOs, exames admissionais/demissionais |
| 9 | **Uniformes & EPIs** | Distribuição, estoque, reposição |
| 10 | **Motoristas & Veículos** | CNH, CFC, veículos da frota |
| 11 | **Ocorrências** | Registro de ocorrências nos postos |
| 12 | **Férias & Afastamentos** | Gestão de férias, atestados, licenças |
| 13 | **Benefícios** | VR, VT, plano de saúde, vale-creche |
| 14 | **BI & Relatórios** | Dashboards e relatórios gerenciais |
| 15 | **Agente Spark (N8N)** | Assistente virtual WhatsApp/SMS/App |
| 16 | **HE Separado (Porteiros)** | Pagamento de horas extras de escala extra fora do holerite (sem encargos) |

### 2.2 Escopo Excluído

- Portal para clientes externos (acesso apenas interno)
- Sistema financeiro (contas a pagar/receber)
- Comercial/vendas (CRM)
- App do cliente para acompanhamento

---

## 3. Arquitetura do Sistema

### 3.1 Modelo de Acesso

```
┌─────────────────────────────────────────────────────────────┐
│                    ACESSO AO SISTEMA                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  COLABORADORES (Vigilantes, Porteiros, etc.):              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  App Spark (Único - React Native)                    │   │
│  │  ├── Aba PONTO: GPS + biometria/facial               │   │
│  │  ├── Aba ESCALA: Calendário de turnos                │   │
│  │  ├── Aba MENU: RH/DP (holerite, EPI, treinamentos)  │   │
│  │  └── Aba AGENTE: Chat com Agente Spark (N8N)        │   │
│  └─────────────────────────────────────────────────────┘   │
│           +                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Web (Complementar - React)                          │   │
│  │  Mesmas funcionalidades do módulo MENU do app        │   │
│  │  (acesso via desktop/navegador)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  GESTORES / DP / RH / ADMIN:                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Web (Principal - React + Preline)                   │   │
│  │  Painel completo de gestão                           │   │
│  │  Login: CPF + senha (ou e-mail para admin)           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  AGENTE SPARK (N8N):                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WhatsApp Business API / SMS / Chat App              │   │
│  │  Assistente virtual para solicitações e consultas    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Stack Tecnológica

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Web)                     │
│  React 18+ / TypeScript / Vite                       │
│  Preline UI + Tailwind CSS v4                        │
│  Recharts / ApexCharts (gráficos BI)                 │
│  Zustand (state management)                          │
│  React Query (server state)                          │
│  React Hook Form + Zod (formulários/validação)       │
│  Axios (HTTP client)                                 │
│                                                      │
│  ⚠️ REGRA: Componentização 100% com Preline          │
│  Usar componentes Preline sempre que disponível.     │
│  Criar componentes custom apenas quando necessário.  │
│  Ver: 13-COMPONENTIZACAO-PRELINE.md                  │
└─────────────────────────────────────────────────────┘
                          │
                    REST API / JWT
                          │
┌─────────────────────────────────────────────────────┐
│                   BACKEND (API)                       │
│  NestJS 10+ / TypeScript                             │
│  Prisma ORM                                          │
│  PostgreSQL 16                                       │
│  JWT (autenticação - login por CPF)                 │
│  class-validator + class-transformer                 │
│  Bull (filas - cálculos pesados)                     │
│  node-cron (tarefas agendadas)                       │
│                                                      │
│  ⚠️ Módulos de pagamento:                            │
│  - Folha de Pagamento (vigilantes - com encargos)   │
│  - HE Separado (porteiros - sem encargos)           │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   MOBILE (App Spark - Único)          │
│  React Native / Expo                                 │
│  ├── Ponto: GPS + biometria/facial                   │
│  ├── Escala: Calendário de turnos                    │
│  ├── RH/DP: Holerite, EPI, treinamentos              │
│  └── Agente: Chat com N8N                            │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│               AUTOMAÇÃO (N8N)                        │
│  Agente Spark (WhatsApp Business / SMS)             │
│  Workflows de aprovação e notificação               │
│  Integração com API Spark                           │
└─────────────────────────────────────────────────────┘
```

### 3.2 Diagrama de Arquitetura

```
                    ┌──────────────┐
                    │   Usuários   │
                    │  (Web/App)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   CDN/Nginx   │
                    │  (Proxy/SSL)  │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┬──────────────┐
          │                │                │              │
   ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐  ┌───▼────────┐
   │  Frontend   │  │  API       │  │  Mobile    │  │  N8N       │
   │  (React)    │  │ (NestJS)   │  │  (App)     │  │  (Agente)  │
   └─────────────┘  └───┬────────┘  └────┬───────┘  └───┬────────┘
                         │                │              │
                  ┌──────▼────────────────▼──────────────▼──────┐
                  │              PostgreSQL                      │
                  │              + Prisma ORM                    │
                  └─────────────────────────────────────────────┘
```
                    │      PostgreSQL           │
                    │      + Prisma ORM         │
                    └──────────────────────────┘
```

### 3.3 Paleta de Cores (Spark + Dark Mode)

```css
/* Cores extraídas do site sparkvigilancia.com.br */
:root {
  /* Light mode (default) */
  --spark-primary: #1a1a2e;      /* Azul escuro principal */
  --spark-secondary: #16213e;    /* Azul marinho */
  --spark-accent: #e94560;       /* Vermelho acento */
  --spark-gold: #f5a623;         /* Dourado */
  --spark-light: #f8f9fa;        /* Fundo claro */
  --spark-white: #ffffff;        /* Branco */
  
  /* Semânticas */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
}

/* Dark mode - tokens Preline já alternam automaticamente */
/* Usar classes Preline: bg-card, text-foreground, etc. */
/* NÃO hardcodar cores dark - o Preline gerencia isso */
```

> **Dark Mode**: Obrigatório. Toggle disponível na navbar. A preferência é salva no `localStorage` do navegador. Usar tokens Preline (`bg-card`, `text-foreground`) que alternam automaticamente entre light e dark.

---

## 4. Hierarquia Organizacional

```
Grupo Spark
├── Gerência Administrativa
│   ├── Departamento de RH
│   ├── Departamento de DP
│   └── Departamento Financeiro
├── Gerência de Operações
│   ├── Supervisão Regional Norte
│   │   ├── Posto A (ex: Edifício X)
│   │   ├── Posto B (ex: Empresa Y)
│   │   └── Posto C (ex: Condomínio Z)
│   ├── Supervisão Regional Sul
│   │   ├── Posto D
│   │   └── Posto E
│   └── Supervisão Regional Leste
│       ├── Posto F
│       └── Posto G
└── Filiais (Uniforce, Cratos)
```

### 4.1 Níveis de Acesso

| Perfil | Acesso |
|--------|--------|
| **Admin** | Acesso total ao sistema |
| **Gerente** | Módulos de sua área + relatórios BI |
| **Supervisor** | Gestão de postos, escalas, ocorrências do seu setor |
| **DP/RH** | Módulos de colaboradores, ponto, folha, treinamentos |
| **Vigilante** | App mobile (ponto, escala, holerite) |

---

## 5. Fluxos Principais

### 5.1 Fluxo de Contrato → Posto → Colaborador → Ponto → Folha

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Cliente    │───▶│  Contrato   │───▶│   Posto(s)  │
│  (cadastro)  │    │ (valores,   │    │ (local,     │
│              │    │  vigência)  │    │  escala)    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │  Colaborador(s)    │
                                   │  alocado(s) no     │
                                   │  posto             │
                                   └─────────┬─────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │  Escala de         │
                                   │  trabalho          │
                                   │  (turnos/escala)   │
                                   └─────────┬─────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │  Marcação de Ponto │
                                   │  (app/web)         │
                                   └─────────┬─────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │  Espelho de Ponto  │
                                   │  (cálculo HE, AN,  │
                                   │   adicional, etc.) │
                                   └─────────┬─────────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          │                                     │
                          ▼                                     ▼
             ┌─────────────────────────┐           ┌─────────────────────────┐
             │  VIGILANTE              │           │  PORTEIRO               │
             │  HE de Escala Extra     │           │  HE de Escala Extra     │
             │  → Valor fixo           │           │  → Valor fixo           │
             │  → Limite: 3/mês        │           │  → Sem limite           │
             │  → Pago NO holerite     │           │  → Pago SEPARADAMENTE   │
             │  → Com encargos         │           │  → Sem encargos         │
             └───────────┬─────────────┘           └───────────┬─────────────┘
                         │                                     │
                         ▼                                     ▼
             ┌─────────────────────────┐           ┌─────────────────────────┐
             │  Folha de Pagamento     │           │  Pagamento Separado     │
             │  (com encargos CLT)     │           │  (depósito em conta)    │
             └─────────────────────────┘           └─────────────────────────┘
```

### 5.2 Fluxo de Marcação de Ponto (App)

```
Vigilante abre App
       │
       ▼
┌──────────────┐
│ Seleciona    │
│ Posto/Turno  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  Marca Ponto │────▶│ Valida GPS   │
│  (Entrada)   │     │ (raio 100m)  │
└──────┬───────┘     └──────┬───────┘
       │                    │
       │              ┌─────▼─────┐
       │              │ Biometria/ │
       │              │ Facial     │
       │              └─────┬─────┘
       │                    │
       ▼                    ▼
┌──────────────┐
│ Registro     │
│ salvo no     │
│ servidor     │
└──────────────┘
```

### 5.3 Regras de Horas Extras por Tipo de Colaborador

| Regra | Vigilantes | Porteiros |
|-------|------------|-----------|
| **Tipo de HE** | Escala extra | Escala extra |
| **Valor** | Fixo (configurado globalmente) | Fixo (configurado por contrato/posto) |
| **Limite mensal** | 3 escalas extras | Sem limite |
| **Excedente** | Pago no mês seguinte | Pago no mês seguinte |
| **Forma de pagamento** | Dentro do holerite | Fora do holerite (depósito separado) |
| **Encargos trabalhistas** | Sim (INSS, IRRF, FGTS) | Não |
| **Visibilidade** | Colaborador vê no app | Apenas DP/RH (web) |
| **Módulo responsável** | Folha de Pagamento | HE Separado (Porteiros) |

---

## 6. Premissas Técnicas

| Item | Especificação |
|------|---------------|
| **Banco de Dados** | PostgreSQL 16 com Prisma ORM |
| **Autenticação** | JWT com refresh token |
| **Cache** | Redis (sessões, consultas frequentes) |
| **Filas** | Bull (cálculo de folha, relatórios pesados) |
| **Upload** | MinIO ou S3 (documentos, fotos, ASOs) |
| **Logs** | Winston + audit_logs (rastreabilidade) |
| **Testes** | Jest (unit) + Supertest (integration) |
| **CI/CD** | GitHub Actions |
| **Hospedagem** | AWS / DigitalOcean (sugestão) |
| **Dark Mode** | Obrigatório via tokens Preline (toggle light/dark) |
| **Responsividade** | Mobile-first, testado em telas 320px a 2560px |
| **Componentização** | 100% Preline (ver `13-COMPONENTIZACAO-PRELINE.md`) |

---

## 7. Nomenclatura e Convenções

### 7.1 Bancos de Dados

- Tabelas em **snake_case** singular: `employees`, `contracts`, `work_posts`
- Colunas em **snake_case**: `created_at`, `is_active`
- UUIDs como primary key (exceto tabelas de configuração)
- Timestamps obrigatórios: `created_at`, `updated_at`
- Soft delete: `deleted_at` (nullable)

### 7.2 API

- Endpoints REST em **kebab-case**: `/api/v1/work-posts`
- Versionamento por URL: `/api/v1/`, `/api/v2/`
- Resposta padrão:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

### 7.3 Frontend

- Componentes em **PascalCase**: `EmployeeCard.tsx`
- Hooks em **camelCase**: `useEmployees.ts`
- Utilitários em **camelCase**: `formatCurrency.ts`
- Estilos: Tailwind CSS utility-first
- **Componentização**: 100% Preline (ver `13-COMPONENTIZACAO-PRELINE.md`)
- **Design tokens**: Usar tokens do Preline (`bg-card`, `text-foreground`, etc.)
- **Dark mode**: Via tokens Preline (não usar `dark:` em tokens)

---

## 8. Próximos Passos

1. Validar este SPEC com a equipe Spark
2. Definir prioridades de desenvolvimento (MVP vs fases)
3. Iniciar modelagem detalhada do banco de dados
4. Criar wireframes das telas principais
5. Configurar repositório e ambiente de desenvolvimento

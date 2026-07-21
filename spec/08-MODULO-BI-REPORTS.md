# SPEC - Módulo 07: BI & Relatórios

## 1. Visão Geral

Módulo de Business Intelligence e relatórios gerenciais para tomada de decisão, com dashboards interativos e exportação de dados.

---

## 2. Dashboards

### 2.1 Dashboard Executivo (Home)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPARK RH & DP - PAINEL GERAL                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Colaboradores│ │ Postos      │ │ Contratos   │ │ Custo     │ │
│  │ Ativos       │ │ Ativos      │ │ Ativos      │ │ Mensal    │ │
│  │              │ │             │ │             │ │           │ │
│  │    380       │ │    120      │ │    45       │ │ R$ 630mil │ │
│  │  ▲ 12 vs mês │ │  ▲ 3 vs mês│ │  ▲ 1 vs mês│ │ ▲ 5%      │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ALERTAS                                                  │   │
│  │  ──────────                                               │   │
│  │  🔴 5 ASOs vencidos                │ 🔴 3 CNH vencidas   │   │
│  │  🟡 8 Treinamentos vencendo        │ 🟡 2 Seguros vencendo│  │
│  │  🔵 12 Contratos vencendo 90 dias  │ 🟢 0 Ocorrências crít│ │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────┐ ┌──────────────────────────────┐  │
│  │  EVOLUÇÃO DO CUSTO        │ │  DISTRIBUIÇÃO POR EMPRESA    │  │
│  │  (6 meses)                │ │                              │  │
│  │                           │ │  Spark    ████████████ 60%   │  │
│  │  R$650k ─────●            │ │  Uniforce ██████      28%   │  │
│  │  R$620k ───●              │ │  Cratos   ███         12%   │  │
│  │  R$590k ─●                │ │                              │  │
│  │  Jan Fev Mar Abr Mai Jun  │ │                              │  │
│  └──────────────────────────┘ └──────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Dashboard de Colaboradores

| Indicador | Descrição | Fórmula |
|-----------|-----------|---------|
| **Headcount** | Total de colaboradores ativos | COUNT(status = ATIVO) |
| **Admissões** | Novas admissões no período | COUNT(admission_date IN period) |
| **Demissões** | Desligamentos no período | COUNT(resignation_date IN period) |
| **Turnover** | Taxa de rotatividade | (Admissões + Demissões) / Média Headcount × 100 |
| **Tempo Médio Empresa** | Tempo médio de casa | AVG(NOW() - admission_date) |
| **Idade Média** | Idade média dos colaboradores | AVG(NOW() - birth_date) |
| **Gênero** | Distribuição por sexo | GROUP BY gender |
| **Escolaridade** | Distribuição por escolaridade | GROUP BY education_level |

### 2.3 Dashboard de Absenteísmo

| Indicador | Descrição | Fórmula |
|-----------|-----------|---------|
| **Taxa de Absenteísmo** | % de faltas | (Dias falta / Dias úteis) × 100 |
| **Média Atrasos** | Atrasos por colaborador | COUNT(atrasos) / headcount |
| **ATESTADOS** | Total de atestados no período | COUNT(tipo = ATESTADO) |
| **AFASTAMENTOS** | Total de afastamentos | COUNT(tipo IN (INSS, MEDICO, etc.)) |
| **Por Posto** | Absenteísmo por posto | GROUP BY post_id |
| **Por Departamento** | Absenteísmo por depto | GROUP BY department_id |

### 2.4 Dashboard de Horas Extras

| Indicador | Descrição | Fórmula |
|-----------|-----------|---------|
| **Total HE Mês** | Horas extras no mês | SUM(overtime_hours) |
| **Custo HE** | Custo total de HE | SUM(overtime_value) |
| **HE por Posto** | Horas extras por posto | GROUP BY post_id |
| **HE por Colaborador** | Top 10 com mais HE | ORDER BY overtime_hours DESC |
| **Média HE/Mês** | Média de HE por colaborador | AVG(overtime_hours) |
| **HE > Limite** | Colaboradores com HE > 40h/mês | FILTER(overtime > 40) |

### 2.5 Dashboard de Custo

| Indicador | Descrição | Visualização |
|-----------|-----------|--------------|
| **Custo Total** | Folha + encargos | Valor absoluto |
| **Custo por Empresa** | Spark, Uniforce, Cratos | Gráfico pizza |
| **Custo por Posto** | Ranking de postos | Top 10 / Bottom 10 |
| **Custo por Contrato** | Custo vs receita do contrato | Comparativo |
| **Custo por Colaborador** | Custo médio por funcionário | Média / mediana |
| **Evolução Mensal** | Tendência de custo | Linha 12 meses |
| **Custo vs Receita** | Margem por contrato | Barras comparativas |

### 2.6 Dashboard de Ponto

| Indicador | Descrição | Visualização |
|-----------|-----------|--------------|
| **Marcações Hoje** | Total de marcações | Número absoluto |
| **Pontualidade** | % de marcações no horário | Gauge |
| **Atrasos** | Total de atrasos | Número + tendência |
| **Irregularidades** | Pontos irregulares | Lista + status |
| **Por Posto** | Marcações por posto | Ranking |
| **Horário Pico** | Horários com mais marcações | Gráfico de barras |

---

## 3. Relatórios

### 3.1 Relatórios Disponíveis

| # | Relatório | Descrição | Formatos |
|---|-----------|-----------|----------|
| 1 | **Relatório Geral de Colaboradores** | Lista completa com dados e status | PDF, XLSX |
| 2 | **Aniversariantes do Mês** | Colaboradores que fazem aniversário | PDF, XLSX |
| 3 | **Admissões do Período** | Novas admissões | PDF, XLSX |
| 4 | **Demissões do Período** | Desligamentos | PDF, XLSX |
| 5 | **Espelho de Ponto** | Espelho individual do colaborador | PDF |
| 6 | **Folha de Pagamento** | Resumo da folha mensal | PDF, XLSX |
| 7 | **Holaterite** | Holaterite individual | PDF |
| 8 | **Relatório de Treinamentos** | Status de conformidade | PDF, XLSX |
| 9 | **Relatório de ASOs** | Status de ASOs | PDF, XLSX |
| 10 | **Relatório de Uniformes** | Distribuição e estoque | PDF, XLSX |
| 11 | **Relatório de Ocorrências** | Ocorrências por período/posto | PDF, XLSX |
| 12 | **Relatório de Turnover** | Taxa de rotatividade | PDF, XLSX |
| 13 | **Relatório de Absenteísmo** | Análise de faltas | PDF, XLSX |
| 14 | **Relatório de Horas Extras** | HE por período/colaborador | PDF, XLSX |
| 15 | **Custo por Cliente/Posto** | Análise de custo | PDF, XLSX |
| 16 | **Relatório de Férias** | Calendário e pendências | PDF, XLSX |
| 17 | **Relatório de Afastamentos** | Afastamentos ativos | PDF, XLSX |
| 18 | **Relatório de Benefícios** | Resumo de benefícios | PDF, XLSX |
| 19 | **Exportação eSocial** | XML para envio ao eSocial | XML |
| 20 | **Exportação Bancária** | Arquivo de pagamento | TXT, CNAB |

### 3.2 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/reports` | Listar relatórios disponíveis |
| POST | `/api/v1/reports/generate` | Gerar relatório |
| GET | `/api/v1/reports/:id` | Status da geração |
| GET | `/api/v1/reports/:id/download` | Download do arquivo |
| GET | `/api/v1/reports/templates` | Templates disponíveis |

### 3.3 Filtros Comuns

Todos os relatórios aceitam filtros:

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `companyId` | UUID | Empresa do grupo |
| `departmentId` | UUID | Departamento |
| `postId` | UUID | Posto de trabalho |
| `contractId` | UUID | Contrato |
| `dateFrom` | date | Data início |
| `dateTo` | date | Data fim |
| `format` | enum | PDF, XLSX, CSV |

---

## 4. KPIs Calculados

### 4.1 Turnover

```sql
-- Cálculo mensal
WITH monthly AS (
  SELECT 
    DATE_TRUNC('month', resignation_date) AS month,
    COUNT(*) AS resignations,
    (SELECT COUNT(*) FROM employees WHERE status = 'ATIVO') AS headcount
  FROM employees
  WHERE resignation_date >= :start AND resignation_date < :end
  GROUP BY month
)
SELECT 
  month,
  resignations,
  headcount,
  ROUND((resignations::DECIMAL / headcount) * 100, 2) AS turnover_rate
FROM monthly;
```

### 4.2 Absenteísmo

```sql
-- Cálculo por colaborador
SELECT 
  e.id,
  e.full_name,
  COUNT(t.id) AS absence_days,
  ROUND((COUNT(t.id)::DECIMAL / :workdays_in_period) * 100, 2) AS absence_rate
FROM employees e
LEFT JOIN leaves t ON t.employee_id = e.id
  AND t.start_date >= :period_start
  AND t.end_date <= :period_end
WHERE e.status = 'ATIVO'
GROUP BY e.id, e.full_name
ORDER BY absence_rate DESC;
```

### 4.3 Custo por Posto

```sql
-- Custo total do posto (folha + encargos)
SELECT 
  wp.id,
  wp.name,
  wp.code,
  SUM(p.gross_total) AS total_salary,
  SUM(p.fgts_value) AS total_fgts,
  SUM(p.inss_base * 0.20) AS total_inss_patronal,
  SUM(p.gross_total + p.fgts_value + (p.inss_base * 0.20)) AS total_cost,
  c.monthly_value AS contract_value,
  (c.monthly_value - SUM(p.gross_total + p.fgts_value + (p.inss_base * 0.20))) AS margin
FROM work_posts wp
JOIN contracts c ON c.id = wp.contract_id
JOIN assignments a ON a.post_id = wp.id
JOIN payrolls p ON p.employee_id = a.employee_id
WHERE p.status = 'PAGO'
  AND p.period_id = :period_id
GROUP BY wp.id, wp.name, wp.code, c.monthly_value
ORDER BY total_cost DESC;
```

---

## 5. Exportação eSocial

### 5.1 Eventos

| Evento | Descrição |
|--------|-----------|
| S-1200 | Remuneração do trabalhador |
| S-1210 | Pagamento de rendimentos do trabalho |
| S-1299 | Fechamento dos eventos de origem |
| S-1202 | Contribuição previdenciária sobre a folha |

### 5.2 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/esocial/events` | Listar eventos gerados |
| POST | `/api/v1/esocial/generate` | Gerar XML do período |
| GET | `/api/v1/esocial/:id/xml` | Download do XML |
| POST | `/api/v1/esocial/:id/validate` | Validar XML |

---

## 6. Configurações de Relatórios

### 6.1 Logo e Identidade

```typescript
const reportConfig = {
  companyName: 'Spark Vigilância e Segurança',
  cnpj: 'XX.XXX.XXX/0001-XX',
  address: 'Rua Castelo Branco, 1012 - Centro - Vila Velha/ES',
  phone: '(27) 3534-3568',
  logo: '/assets/spark-logo.png',
  primaryColor: '#1a1a2e',
  accentColor: '#e94560',
};
```

### 6.2 Templates

- **Executivo**: Resumo com gráficos e KPIs
- **Operacional**: Detalhado com listas e tabelas
- **Financeiro**: Focado em valores e custos
- **Conformidade**: Checklists e status de documentos

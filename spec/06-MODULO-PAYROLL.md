# SPEC - Módulo 05: Folha de Pagamento

## 1. Visão Geral

Módulo de cálculo completo da folha de pagamento CLT, incluindo adiantamento, fechamento, encargos sociais e trabalhistas, benefícios e geração de holerites.

---

## 2. Processo de Folha

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Espelho de  │────▶│ Cálculo de  │────▶│ Cálculo de  │
│ Ponto       │     │ Horas       │     │ Proventos   │
│ (aprovado)  │     │ (HE, AN)    │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ Cálculo de Descontos   │
                                    │ (INSS, IRRF, VT, VR)  │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ Cálculo de Encargos    │
                                    │ (FGTS, INSS Patronal) │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ Totalização e Status  │
                                    │ PENDENTE → CALCULADO  │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ Aprovação (DP/RH)     │
                                    │ CALCULADO → APROVADO  │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ Pagamento             │
                                    │ APROVADO → PAGO       │
                                    └───────────────────────┘
```

---

## 3. Tipos de Folha

### 3.1 Adiantamento (15ª folha)

| Item | Descrição |
|------|-----------|
| **Quando** | Até dia 30/31 do mês corrente |
| **Cálculo** | 50% do salário base (proporcional dias trabalhados) |
| **Descontos** | VT (proporcional), VR (proporcional) |
| **Encargos** | Sem descontos de INSS/IRRF |
| **Forma** | PIX ou depósito |

### 3.2 Fechamento (Folha mensal)

| Item | Descrição |
|------|-----------|
| **Quando** | Até dia 05 do mês seguinte |
| **Cálculo** | Salário + proventos - descontos |
| **Proventos** | Salário base, HE, AN, periculosidade, insalubridade |
| **Descontos** | INSS, IRRF, VT, VR, plano de saúde, adiantamento |
| **Encargos** | FGTS (8%), INSS patronal, SAT, terceiros |
| **Forma** | PIX ou depósito |

---

## 4. Tabelas de Cálculo

### 4.1 INSS 2026 (Valores de referência - atualizar conforme legislação)

| Faixa | Alíquota | Salário de Contribuição |
|-------|----------|------------------------|
| 1ª | 7,5% | Até R$ 1.412,00 |
| 2ª | 9% | De R$ 1.412,01 até R$ 2.666,68 |
| 3ª | 12% | De R$ 2.666,69 até R$ 4.000,03 |
| 4ª | 14% | De R$ 4.000,04 até R$ 7.786,02 |

### 4.2 IRRF 2026 (Valores de referência)

| Faixa | Alíquota | Dedução |
|-------|----------|---------|
| Até R$ 2.259,20 | Isento | R$ 0,00 |
| De R$ 2.259,21 até R$ 2.826,65 | 7,5% | R$ 169,44 |
| De R$ 2.826,66 até R$ 3.751,05 | 15% | R$ 381,44 |
| De R$ 3.751,06 até R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

### 4.3 Deduções por Dependente

| Tipo | Valor Mensal |
|------|-------------|
| Dependente de IR | R$ 189,59 |
| Salário Família (até R$ 1.637,43) | R$ 59,82 por dependente |

---

## 5. Cálculo de Horas Extras

### 5.1 Adicionais Legais

| Tipo | Adicional | Limite |
|------|-----------|--------|
| HE Normal (dias úteis) | 50% | Até 2h/dia |
| HE Domingos/Feriados | 100% | Sem limite |
| Adicional Noturno (22h-05h) | 20% | Hora reduzida: 52min30s |
| Insalubridade (mínimo) | 10% | Sobre salário mínimo |
| Insalubridade (médio) | 20% | Sobre salário mínimo |
| Insalubridade (máximo) | 40% | Sobre salário mínimo |
| Periculosidade | 30% | Sobre salário base |

### 5.2 Fórmulas

```
Valor HE Normal = (Salário Base / 220) × Horas Extras × 1,5
Valor HE 100% = (Salário Base / 220) × Horas Extras × 2,0
Valor AN = (Salário Base / 220) × Horas Noturnas × 1,2 × (220/275)
```

### 5.3 Horas Extras de Escala Extra (Vigilantes)

> **⚠️ Regra específica para VIGILANTES.**
> 
> Porteiros possuem regra diferente - ver módulo `14-MODULO-HE-SEPARADO-PORTARIA.md`.

| Item | Descrição |
|------|-----------|
| **Tipo** | Escala extra (fora da escala regular) |
| **Valor** | Fixo (configurado globalmente na tabela `overtime_config`) |
| **Limite mensal** | 3 escalas extras por mês |
| **Excedente** | Pago no mês seguinte (mesmo valor) |
| **Forma de pagamento** | Dentro do holerite normal |
| **Encargos trabalhistas** | Sim (INSS, IRRF, FGTS - como provento normal) |
| **Visibilidade** | Colaborador vê no app (aba holerite) |

**Regra de Cálculo:**

```
Exemplo:
  Vigilante: Maria Santos
  Valor fixo por escala extra: R$ 150,00 (configurado globalmente)
  
  Julho/2026:
  - Escalas extras trabalhadas: 5
  - Limite mensal: 3
  - Excedente: 2 escalas (pago em Agosto)
  
  Holerite Julho/2026:
  ┌─────────────────────────────────────────────────────┐
  │  PROVENTOS                                           │
  ├─────────────────────────────────────────────────────┤
  │  Salário Base                      R$ 3.000,00     │
  │  HE Escala Extra (3 × R$ 150)     R$   450,00     │
  │  ...                                                 │
  ├─────────────────────────────────────────────────────┤
  │  Total Proventos                   R$ 3.450,00     │
  │  (Encargos: INSS, IRRF, FGTS sobre R$ 3.450,00)   │
  └─────────────────────────────────────────────────────┘
  
  Holerite Agosto/2026:
  ┌─────────────────────────────────────────────────────┐
  │  PROVENTOS                                           │
  ├─────────────────────────────────────────────────────┤
  │  Salário Base                      R$ 3.000,00     │
  │  HE Escala Extra - Excedente Jul   R$   300,00     │
  │  ...                                                 │
  ├─────────────────────────────────────────────────────┤
  │  Total Proventos                   R$ 3.300,00     │
  │  (Encargos: INSS, IRRF, FGTS sobre R$ 3.300,00)   │
  └─────────────────────────────────────────────────────┘
```

**Fluxo de Processamento:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Espelho de   │────▶│ Contagem de  │────▶│ Verificação  │
│ Ponto        │     │ Escalas      │     │ do Limite    │
│ (aprovado)   │     │ Extras       │     │ (3/mês)      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                          ┌───────────────────────┴───────────────────────┐
                          │                                               │
                          ▼                                               ▼
             ┌─────────────────────────┐             ┌─────────────────────────┐
             │  Até 3 escalas          │             │  Acima de 3 escalas     │
             │  → Inclui no mês atual  │             │  → Inclui no mês seguinte│
             │  → Adiciona ao holerite │             │  → Aguarda processamento │
             └─────────────────────────┘             └─────────────────────────┘
```

---

## 6. Cálculo de Descontos

### 6.1 INSS (Progressivo)

```typescript
function calculateINSS(grossSalary: number): number {
  const brackets = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 },
  ];
  
  let inss = 0;
  let previousLimit = 0;
  
  for (const bracket of brackets) {
    if (grossSalary <= bracket.limit) {
      inss += (grossSalary - previousLimit) * bracket.rate;
      break;
    }
    inss += (bracket.limit - previousLimit) * bracket.rate;
    previousLimit = bracket.limit;
  }
  
  return Math.min(inss, grossSalary * 0.14); // Teto
}
```

### 6.2 IRRF (Progressivo)

```typescript
function calculateIRRF(baseIRRF: number): number {
  const brackets = [
    { limit: 2259.20, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 },
  ];
  
  for (const bracket of brackets) {
    if (baseIRRF <= bracket.limit) {
      const irrf = (baseIRRF * bracket.rate) - bracket.deduction;
      return Math.max(0, irrf);
    }
  }
  
  return 0;
}
```

---

## 7. Endpoints da API

### Períodos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/payroll-periods` | Listar períodos |
| POST | `/api/v1/payroll-periods` | Criar período |
| GET | `/api/v1/payroll-periods/:id` | Buscar período |
| PUT | `/api/v1/payroll-periods/:id` | Atualizar período |
| POST | `/api/v1/payroll-periods/:id/process` | Processar período (calcular) |

### Folha de Pagamento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/payrolls` | Listar registros (filtros) |
| POST | `/api/v1/payrolls/calculate` | Calcular folha do período |
| GET | `/api/v1/payrolls/:id` | Buscar registro completo |
| PUT | `/api/v1/payrolls/:id` | Ajustar registro manualmente |
| POST | `/api/v1/payrolls/:id/approve` | Aprovar registro |
| POST | `/api/v1/payrolls/bulk-approve` | Aprovar em massa |
| GET | `/api/v1/payrolls/:id/payslip` | Gerar holerite (PDF) |
| GET | `/api/v1/payrolls/period/:periodId/summary` | Resumo do período |
| GET | `/api/v1/payrolls/period/:periodId/export` | Exportar XML/CSV (eSocial) |

### Benefícios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/payroll-benefits` | Listar benefícios |
| POST | `/api/v1/payroll-benefits` | Adicionar benefício |
| PUT | `/api/v1/payroll-benefits/:id` | Atualizar benefício |
| DELETE | `/api/v1/payroll-benefits/:id` | Remover benefício |

---

## 8. Layout do Holerite

```
┌─────────────────────────────────────────────────────────────┐
│                    HOLERITE - MENSAL                          │
│  SPARK VIGILÂNCIA E SEGURANÇA                                │
│  CNPJ: XX.XXX.XXX/0001-XX                                   │
├─────────────────────────────────────────────────────────────┤
│  Colaborador: João da Silva                                  │
│  Matrícula: 2026SPK0001                                      │
│  CPF: XXX.XXX.XXX-XX                                        │
│  Função: Vigilante                                           │
│  Posto: Edifício Central                                     │
│  Competência: Julho/2026                                     │
├─────────────────────┬───────────────────────────────────────┤
│     PROVENTOS       │           DESCONTOS                    │
├─────────────────────┼───────────────────────────────────────┤
│ Salário Base        │ INSS                    R$  420,00   │
│       R$ 3.000,00   │ IRRF                    R$  180,00   │
│                     │ Vale Transporte         R$  150,00   │
│ H.E. 50% (10h)      │ Vale Refeição           R$  300,00   │
│       R$  204,55    │ Plano de Saúde          R$  120,00   │
│                     │ Adiantamento            R$ 1.500,00  │
│ Adic. Noturno (20h) │                         │             │
│       R$  163,64    │                         │             │
│                     │                         │             │
├─────────────────────┼───────────────────────────────────────┤
│ Total Proventos     │ Total Descontos                       │
│       R$ 3.368,19   │       R$ 2.670,00                     │
├─────────────────────┴───────────────────────────────────────┤
│                                                              │
│              VALOR LÍQUIDO:           R$   698,19            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Encargos (não descontados do colaborador)                   │
│  FGTS (8%):              R$  269,45                         │
│  INSS Patronal (20%):    R$  673,64                         │
│  SAT (1%):               R$   33,68                         │
│  Total Encargos:         R$  976,77                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Dashboard do Módulo

```
┌─────────────────────────────────────────────────────────┐
│                 DASHBOARD FOLHA                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Folha Líquida│  │ Total       │  │ Custo Total │     │
│  │ Mês          │  │ Encargos    │  │ (Líq+Enc)   │     │
│  │ R$ 450mil    │  │ R$ 180mil   │  │ R$ 630mil   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Custo por Empresa                                │   │
│  │  Spark Vigilância   ████████████████  R$ 380mil  │   │
│  │  Uniforce           ████████         R$ 180mil   │   │
│  │  Cratos             ███              R$  70mil   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Top 5 Postos por Custo                           │   │
│  │  1. Edifício Central     R$ 45.000                │   │
│  │  2. Shopping Vila Velha  R$ 38.000                │   │
│  │  3. Empresa XYZ          R$ 32.000                │   │
│  │  4. Condomínio ABC       R$ 28.000                │   │
│  │  5. Indústria DEF        R$ 25.000                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Evolução Mensal (6 meses)                        │   │
│  │  Jan ████████████████████  R$ 580mil              │   │
│  │  Fev █████████████████████ R$ 600mil              │   │
│  │  Mar ████████████████████  R$ 590mil              │   │
│  │  Abr ██████████████████████ R$ 620mil             │   │
│  │  Mai ███████████████████████ R$ 640mil            │   │
│  │  Jun ████████████████████████ R$ 650mil           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Regras de Negócio

### 10.1 Processamento

1. Espelho de ponto **obrigatoriamente aprovado** antes do cálculo
2. Cálculo automático: Dia 1 do mês seguinte
3. Ajustes manuais: Apenas com justificativa e auditoria
4. Aprovação: DP/RH (múltiplos aprovadores para valores > R$ 10mil)
5. Recálculo: Possível até pagamento; após, apenas aditivo

### 10.2 Adiantamento

1. 50% do salário base (proporcional ao período trabalhado)
2. Descontado no fechamento mensal
3. Não inclui horas extras
4. Benefícios proporcionais (VT, VR)

### 10.3 Fechamento

1. Salário base proporcional (220h mensais)
2. Horas extras com adicionais (50% ou 100%)
3. Adicional noturno (20% sobre hora reduzida)
4. Descontos de INSS/IRRF progressivos
5. Descontos de benefícios
6. Desconto do adiantamento
7. Cálculo de encargos patronais

### 10.4 Integração

| Sistema | Integração |
|---------|-----------|
| **eSocial** | Exportação XML para envio obrigatório |
| **Banco** | Exportação arquivo de pagamento (PIX/DOC) |
| **Ponto** | Leitura automática do espelho aprovado |
| **BI** | Alimenta indicadores de custo |

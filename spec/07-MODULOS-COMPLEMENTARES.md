# SPEC - Módulo 06: Módulos Complementares

## 1. Treinamentos & Certificados

### 1.1 Visão

Controle de treinamentos obrigatórios (NRs), reciclagens, capacitacoes e certificados dos colaboradores do setor de vigilância.

### 1.2 Tipos de Treinamento

| Categoria | Descrição | Validade |
|-----------|-----------|----------|
| **NR-10** | Segurança em Instalações e Serviços em Eletricidade | 2 anos |
| **NR-12** | Segurança no Trabalho em Máquinas e Equipamentos | 2 anos |
| **NR-20** | Segurança e Saúde no Trabalho com Líquidos Combustíveis | 2 anos |
| **NR-35** | Trabalho em Altura | 2 anos |
| **Defesa Pessoal** | Técnicas de defesa pessoal para vigilantes | 1 ano |
| **Primeiros Socorros** | Capacitação em primeiros socorros | 1 ano |
| **Manipulação de Extintores** | Uso de extintores de incêndio | 1 ano |
| **CFTV/Monitoramento** | Operação de sistemas de monitoramento | 1 ano |
| **Reciclagem SENAI** | Reciclagem conforme exigência | Conforme NR |
| **Outros** | Treinamentos diversos | Variável |

### 1.3 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Colaborador | ✅ | |
| Nome do treinamento | ✅ | |
| Categoria | ✅ | NR, RECICLAGEM, CAPACITACAO, OUTROS |
| Fornecedor | ❌ | Empresa que ministrou |
| Carga horária | ✅ | Em horas |
| Data início | ✅ | |
| Data conclusão | ❌ | |
| Data de validade | ✅ | Para reciclagens |
| Nº do certificado | ❌ | |
| Certificado (arquivo) | ❌ | Upload PDF/imagem |
| Status | ✅ | EM_ANDAMENTO, CONCLUIDO, VENCIDO, CANCELADO |

### 1.4 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/trainings` | Listar treinamentos |
| POST | `/api/v1/trainings` | Cadastrar treinamento |
| GET | `/api/v1/trainings/:id` | Buscar treinamento |
| PUT | `/api/v1/trainings/:id` | Atualizar treinamento |
| DELETE | `/api/v1/trainings/:id` | Remover treinamento |
| GET | `/api/v1/trainings/expiring` | Treinamentos vencendo (30/60/90 dias) |
| GET | `/api/v1/trainings/report` | Relatório de conformidade |

### 1.5 Regras

1. Colaborador **não pode ser alocado** em posto sem treinamentos NR obrigatórios válidos
2. Alertas automáticos: 90, 60 e 30 dias antes do vencimento
3. Colaborador com treinamento vencido: status "INADIMPLENTE" no painel
4. Upload de certificado: PDF ou imagem (máx 5MB)

---

## 2. ASO (Atestado de Saúde Ocupacional)

### 2.1 Visão

Controle de exames médicos ocupacionais obrigatórios para conformidade com a NR-7.

### 2.2 Tipos de ASO

| Tipo | Quando | Obrigatório |
|------|--------|:-----------:|
| **Admissional** | Antes da admissão | ✅ |
| **Demissional** | Na demissão | ✅ |
| **Periódico** | A cada 1-2 anos (conforme risco) | ✅ |
| **Retorno ao Trabalho** | Após afastamento > 30 dias | ✅ |
| **Mudança de Função** | Quando muda de função com risco | ✅ |

### 2.3 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Colaborador | ✅ | |
| Tipo | ✅ | ADMISSIONAL, DEMISSIONAL, PERIODICO, etc. |
| Data do exame | ✅ | |
| Data de validade | ✅ | |
| Médico responsável | ✅ | Nome + CRM |
| Clínica | ✅ | |
| Resultado | ✅ | APTO, INAPTO |
| Restrições médicas | ❌ | Ex: não operar máquinas |
| Documento (arquivo) | ❌ | Upload PDF |

### 2.4 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/asos` | Listar ASOs |
| POST | `/api/v1/asos` | Cadastrar ASO |
| GET | `/api/v1/asos/:id` | Buscar ASO |
| PUT | `/api/v1/asos/:id` | Atualizar ASO |
| DELETE | `/api/v1/asos/:id` | Remover ASO |
| GET | `/api/v1/asos/expiring` | ASOs vencendo |
| GET | `/api/v1/asos/report` | Relatório de conformidade |

### 2.5 Regras

1. Colaborador **não pode iniciar** sem ASO admissional válido
2. ASO periódico: Vigência de 1 ano (ou conforme risco)
3. Alertas: 60 e 30 dias antes do vencimento
4. ASO com resultado "INAPTO": Colaborador afastado automaticamente

---

## 3. Uniformes & EPIs

### 3.1 Visão

Controle de estoque e distribuição de uniformes e equipamentos de proteção individual.

### 3.2 Categorias

| Categoria | Exemplos |
|-----------|----------|
| **UNIFORME** | Calça social, camisa Spark, jaqueta, gorro |
| **EPI** | Botina de segurança, colete refletivo, lanterna |
| **CALCADOS** | Botina, tênis, bota |
| **ACESSORIOS** | Crachá, barraca, rádio |

### 3.3 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/uniforms` | Listar itens de uniforme |
| POST | `/api/v1/uniforms` | Cadastrar item |
| PUT | `/api/v1/uniforms/:id` | Atualizar item |
| GET | `/api/v1/uniforms/stock` | Estoque atual |
| POST | `/api/v1/uniforms/distribute` | Distribuir uniforme |
| POST | `/api/v1/uniforms/return` | Registrar devolução |
| GET | `/api/v1/employees/:id/uniforms` | Uniformes do colaborador |
| GET | `/api/v1/uniforms/report` | Relatório de distribuição |

### 3.4 Regras

1. Distribuição registrada com data, quantidade e assinatura digital
2. Alerta de estoque mínimo automático
3. Uniformes danificados: registrar devolução e emitir reposição
4. Desconto em folha para uniformes não devolvidos na demissão

---

## 4. Motoristas & Veículos

### 4.1 Visão

Controle de motoristas (CNH, CFC) e veículos da frota para operações de ronda e escolta.

### 4.2 Endpoints - Veículos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/vehicles` | Listar veículos |
| POST | `/api/v1/vehicles` | Cadastrar veículo |
| GET | `/api/v1/vehicles/:id` | Buscar veículo |
| PUT | `/api/v1/vehicles/:id` | Atualizar veículo |
| DELETE | `/api/v1/vehicles/:id` | Desativar veículo |
| GET | `/api/v1/vehicles/alerts` | Documentos vencendo |

### 4.3 Endpoints - Motoristas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/drivers` | Listar motoristas |
| POST | `/api/v1/drivers` | Cadastrar motorista |
| GET | `/api/v1/drivers/:id` | Buscar motorista |
| PUT | `/api/v1/drivers/:id` | Atualizar motorista |
| GET | `/api/v1/drivers/alerts` | CNH/CFC vencendo |

### 4.4 Alertas Automáticos

| Documento | Antecedência |
|-----------|-------------|
| CNH | 90, 60, 30 dias antes do vencimento |
| CFC | 90, 60, 30 dias antes da validade |
| Seguro do veículo | 30 dias antes |
| IPVA | 30 dias antes |
| Licenciamento | 60 dias antes |

---

## 5. Ocorrências

### 5.1 Visão

Registro e acompanhamento de ocorrências nos postos de serviço (roubos, incêndios, invasões, etc.).

### 5.2 Tipos de Ocorrência

| Tipo | Severidade Padrão |
|------|-------------------|
| ROUBO | CRITICA |
| INCENDIO | CRITICA |
| INVASAO | ALTA |
| VAZAMENTO | MEDIA |
| ELETRICIDADE | ALTA |
| ACIDENTE | ALTA |
| AVARIA | MEDIA |
| OUTROS | BAIXA |

### 5.3 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/occurrences` | Listar ocorrências |
| POST | `/api/v1/occurrences` | Registrar ocorrência |
| GET | `/api/v1/occurrences/:id` | Buscar ocorrência |
| PUT | `/api/v1/occurrences/:id` | Atualizar ocorrência |
| PUT | `/api/v1/occurrences/:id/resolve` | Resolver ocorrência |
| GET | `/api/v1/occurrences/report` | Relatório de ocorrências |
| GET | `/api/v1/occurrences/dashboard` | Dashboard de ocorrências |

### 5.4 Campos

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Posto | ✅ | |
| Colaborador (reportou) | ✅ | |
| Tipo | ✅ | |
| Severidade | ✅ | BAIXA, MEDIA, ALTA, CRITICA |
| Descrição | ✅ | Detalhes da ocorrência |
| Ações tomadas | ❌ | O que foi feito |
| Fotos | ❌ | Até 10 fotos |
| Data/hora da ocorrência | ✅ | Pode ser diferente do registro |

---

## 6. Férias & Afastamentos

### 6.1 Férias

#### Regras CLT

| Regra | Descrição |
|-------|-----------|
| Período aquisitivo | 12 meses de trabalho |
| Direito | 30 dias corridos |
| Divisão | Em até 3 períodos (1 com mínimo 14 dias, outros ≥ 5 dias) |
| Abono pecuniário | Venda de até 10 dias (dobro) |
| Primeiro período | Após 12 meses (pode antecipar 14 dias a cada 12 meses) |

#### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/vacations` | Listar férias |
| POST | `/api/v1/vacations` | Programar férias |
| GET | `/api/v1/vacations/:id` | Buscar férias |
| PUT | `/api/v1/vacations/:id` | Alterar férias |
| DELETE | `/api/v1/vacations/:id` | Cancelar férias |
| POST | `/api/v1/vacations/:id/approve` | Aprovar férias |
| GET | `/api/v1/vacations/schedule` | Calendário de férias |
| GET | `/api/v1/employees/:id/vacation-balance` | Saldo de férias |

### 6.2 Afastamentos

| Tipo | Descrição | Pago? |
|------|-----------|:-----:|
| MEDICO | Atestado médico | Sim |
| MATERNIDADE | Licença-maternidade (120 dias) | Sim |
| PATERNIDADE | Licença-paternidade (5 dias) | Sim |
| INSS | Afastamento previdenciário | Conforme INSS |
| ATESTADO | Atestado particular | Conforme política |
| OUTROS | Outros motivos | Variável |

#### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/leaves` | Listar afastamentos |
| POST | `/api/v1/leaves` | Registrar afastamento |
| GET | `/api/v1/leaves/:id` | Buscar afastamento |
| PUT | `/api/v1/leaves/:id` | Atualizar afastamento |
| PUT | `/api/v1/leaves/:id/finish` | Encerrar afastamento |

---

## 7. Benefícios

### 7.1 Tipos de Benefício

| Tipo | Descrição | Cálculo |
|------|-----------|---------|
| **VT** | Vale Transporte | 6% do salário (desconto) |
| **VR** | Vale Refeição | Valor fixo por dia útil |
| **VC** | Vale Creche | Conforme legislação |
| **SAUDE** | Plano de Saúde | Desconto conforme plano |
| **ODONTO** | Plano Odontológico | Desconto conforme plano |
| **OUTROS** | Outros benefícios | Variável |

### 7.2 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/employee-benefits` | Listar benefícios |
| POST | `/api/v1/employee-benefits` | Adicionar benefício |
| PUT | `/api/v1/employee-benefits/:id` | Atualizar benefício |
| DELETE | `/api/v1/employee-benefits/:id` | Remover benefício |
| GET | `/api/v1/employees/:id/benefits` | Benefícios do colaborador |

---

## 8. Dashboard Consolidado

```
┌─────────────────────────────────────────────────────────┐
│              DASHBOARD COMPLEMENTAR                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ALERTAS URGENTES                                  │   │
│  │  🔴 5 ASOs vencidos                               │   │
│  │  🔴 3 CNH vencidas                                │   │
│  │  🟡 8 Treinamentos vencendo (30 dias)             │   │
│  │  🟡 2 Seguros de veículo vencendo                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Colaboradores│  │ Ocorrências │  │ Férias      │     │
│  │ Conformes    │  │ Abertas     │  │ Programadas │     │
│  │    92%       │  │    3        │  │    15       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Uniformes - Estoque Baixo                        │   │
│  │  Botina de Segurança GG    (2 unidades) ⚠️       │   │
│  │  Camisa Spark P            (5 unidades) ⚠️       │   │
│  │  Colete Refletivo M        (3 unidades) ⚠️       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

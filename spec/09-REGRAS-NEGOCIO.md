# SPEC - Regras de Negócio & Validações

## 1. Regras Gerais do Sistema

### 1.1 Hierarquia de Acesso

```
ADMIN
  └── Pode acessar TUDO (todas as empresas, departamentos, postos)
  
MANAGER
  └── Pode acessar: Sua empresa + dados consolidados de BI
  └── Não pode: Gerenciar usuários, configurações do sistema
  
SUPERVISOR
  └── Pode acessar: Apenas postos do seu setor/região
  └── Pode: Gerenciar escalas, aprovar ponto, registrar ocorrências
  └── Não pode: Acessar dados de outros supervisores
  
DP_RH
  └── Pode acessar: Módulos de RH/DP (colaboradores, ponto, folha, treinamentos)
  └── Pode: Todos os módulos de gestão de pessoas
  └── Não pode: Gerenciar postos, contratos (apenas consulta)
  
EMPLOYEE
  └── Pode acessar: Apenas seus dados (app mobile)
  └── Pode: Marcar ponto, ver escala, ver holerite
  └── Não pode: Ver dados de outros colaboradores
```

### 1.2 Soft Delete

- Nenhum registro é fisicamente excluído
- Exclusão lógica via campo `deleted_at`
- Registros deletados não aparecem em listagens
- Dados mantidos para auditoria e relatórios históricos
- Exceção: `audit_logs` e `time_clocks` (nunca deletados)

### 1.3 Auditoria

Todas as ações de create, update e delete são registradas em `audit_logs`:

| Campo | Descrição |
|-------|-----------|
| user_id | Quem fez a ação |
| action | create, update, delete |
| entity | Tabela afetada |
| entity_id | ID do registro |
| old_values | Valores anteriores (JSON) |
| new_values | Novos valores (JSON) |
| ip_address | IP do usuário |
| user_agent | Navegador/dispositivo |

---

## 2. Validações por Módulo

### 2.1 Colaboradores

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| CPF único | Verificar unicidade no banco | "CPF já cadastrado" |
| CPF válido | Algoritmo de dígitos verificadores | "CPF inválido" |
| Matrícula única | Gerada automaticamente ou verificada | "Matrícula já existe" |
| Idade mínima | 18 anos para vigilante (conforme legislação) | "Colaborador deve ter 18+ anos" |
| Data admissão | Não pode ser no futuro | "Data de admissão inválida" |
| E-mail único | Se informado, verificar unicidade | "E-mail já cadastrado" |
| Documentos obrigatórios | CPF, RG, CTPS, PIS | "Documentos obrigatórios pendentes" |

### 2.2 Contratos

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Número único | Verificar unicidade | "Número de contrato já existe" |
| Data início < fim | Se término informado | "Data de término deve ser posterior" |
| Valor positivo | monthly_value > 0 | "Valor deve ser maior que zero" |
| Cliente ativo | Cliente vinculado deve estar ativo | "Cliente está inativo" |
| Postos ao encerrar | Verificar se há postos ativos | "Contrato possui postos ativos" |

### 2.3 Postos de Trabalho

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Código único | Verificar unicidade | "Código do posto já existe" |
| Contrato ativo | Vinculado a contrato ativo | "Contrato está inativo" |
| GPS válido | Coordenadas dentro do Brasil | "Coordenadas inválidas" |
| Mín ≤ Máx | min_staff ≤ max_staff | "Mínimo deve ser ≤ máximo" |
| Colaboradores ao desativar | Verificar alocações ativas | "Posto possui colaboradores alocados" |

### 2.4 Alocações

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Sem conflito de turno | Colaborador não pode estar em 2 postos no mesmo horário | "Conflito de agenda detectado" |
| Posto ativo | Posto deve estar ativo | "Posto está inativo" |
| Colaborador ativo | Colaborador deve estar com status ATIVO | "Colaborador não está ativo" |
| ASO válido | ASO do colaborador deve estar válido | "ASO vencido ou pendente" |
| Treinamentos | NRs obrigatórias devem estar válidas | "Treinamentos obrigatórios vencidos" |
| Vagas disponíveis | Posto deve ter vagas | "Posto sem vagas disponíveis" |
| Período válido | start_date ≤ end_date | "Período inválido" |

### 2.5 Escalas

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Colaborador alocado | Deve estar alocado no posto | "Colaborador não está alocado neste posto" |
| Sem conflito | Não pode ter 2 escalas no mesmo dia/turno | "Conflito de escala" |
| DSR respeitado | Mínimo 24h consecutivas de descanso por semana | "DSR não respeitado" |
| Jornada máxima | 44h/semana (CLT) | "Jornada excede limite legal" |
| Feriados | Verificar feriados nacionais/regionais | "Data é feriado" |

### 2.6 Ponto

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| GPS dentro do raio | Distância ≤ raio configurado | "Fora do raio de marcação" |
| Sequência válida | ENTRADA → ALMOCO_SAIDA → ALMOCO_RETORNO → SAIDA | "Sequência de marcação inválida" |
| Não duplicado | Intervalo mínimo 30min entre marcações do mesmo tipo | "Marcação muito recente" |
| Horário razoável | Máximo ± 2h do horário programado | "Fora do horário programado" |
| Colaborador ativo | Status deve ser ATIVO | "Colaborador não está ativo" |
| Posto ativo | Posto deve estar ativo | "Posto está inativo" |

### 2.7 Folha de Pagamento

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Espelho aprovado | Espelho de ponto deve estar aprovado | "Espelho de ponto pendente" |
| Período aberto | Período deve estar com status ABERTO | "Período já foi processado" |
| Não duplicado | 1 registro por colaborador por período | "Registro já existe para este período" |
| Cálculo automático | Base salarial × horas trabalhadas | — |
| INSS progressivo | Tabela progressiva vigente | — |
| IRRF progressivo | Tabela progressiva vigente | — |
| Adiantamento | 50% do salário base | — |

### 2.8 Férias

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Período aquisitivo | Mínimo 12 meses trabalhados | "Período aquisitivo incompleto" |
| Não coincidente | Não pode coincidir com férias já programadas | "Conflito de férias" |
| Mínimo 14 dias | 1º período deve ter ≥ 14 dias | "Primeiro período deve ter 14+ dias" |
| Demais períodos | ≥ 5 dias cada | "Período deve ter 5+ dias" |
| Máximo 3 períodos | Divisão em até 3 partes | "Limite de divisão atingido" |

### 2.9 Treinamentos

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Validade obrigatória | Para treinamentos NR | "Data de validade é obrigatória" |
| Carga horária > 0 | Deve informar carga horária | "Carga horária inválida" |
| Data conclusão ≥ início | Consistência de datas | "Data de conclusão inválida" |

### 2.10 ASO

| Regra | Validação | Mensagem |
|-------|-----------|----------|
| Tipo obrigatório | Deve informar tipo de ASO | "Tipo de ASO é obrigatório" |
| Resultado obrigatório | APTO ou INAPTO | "Resultado é obrigatório" |
| CRM válido | CRM do médico deve ser informado | "CRM é obrigatório" |
| INAPTO = afastamento | Se resultado INAPTO, sugerir afastamento | "Colaborador INAPTO - afastar?" |

---

## 3. Validações de Formato

### 3.1 CPF
```
Entrada: XXX.XXX.XXX-XX ou XXXXXXXXXXXX
Validação: Algoritmo de dígitos verificadores
Saída: XXX.XXX.XXX-XX (formatado)
```

### 3.2 CNPJ
```
Entrada: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX
Validação: Algoritmo de dígitos verificadores
Saída: XX.XXX.XXX/XXXX-XX (formatado)
```

### 3.3 Telefone
```
Entrada: (XX) XXXXX-XXXX ou XX XXXXX-XXXX
Validação: Mínimo 10 dígitos
Saída: (XX) XXXXX-XXXX (formatado)
```

### 3.4 CEP
```
Entrada: XXXXX-XXX ou XXXXXXXX
Validação: 8 dígitos numéricos
Saída: XXXXX-XXX (formatado)
```

### 3.5 E-mail
```
Validação: Formato RFC 5322
Normalização: lowercase
```

### 3.6 Senha
```
Regras:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Máximo 64 caracteres
```

---

## 4. Notificações Automáticas

### 4.1 Alertas por E-mail

| Evento | Destinatário | Antecedência |
|--------|-------------|-------------|
| ASO vencendo | DP_RH + Supervisor | 60 e 30 dias |
| ASO vencido | DP_RH + Manager | Imediato |
| Treinamento vencendo | DP_RH + Supervisor | 60 e 30 dias |
| CNH vencendo | DP_RH + Manager | 90, 60, 30 dias |
| CFC vencendo | DP_RH + Manager | 90, 60, 30 dias |
| Contrato vencendo | Manager + Comercial | 90, 60, 30 dias |
| Seguro veículo vencendo | DP_RH + Manager | 30 dias |
| IPVA vencendo | Financeiro | 30 dias |
| Férias pendentes (>18 meses) | DP_RH | Imediato |
| Estoque uniforme baixo | DP_RH + Almoxarife | Imediato |

### 4.2 Notificações no Sistema

| Evento | Destinatário |
|--------|-------------|
| Nova escala publicada | Colaboradores do posto |
| Espelho de ponto disponível | Colaborador |
| Holerite disponível | Colaborador |
| Aprovação de ponto pendente | Supervisor |
| Ocorrência registrada | Supervisor + DP_RH |
| Documento enviado para análise | DP_RH |

---

## 5. Regras de Negócio Setoriais (Vigilância)

### 5.1 Habilitação Profissional

| Requisito | Descrição |
|-----------|-----------|
| Registro na Polícia Federal | Obrigatório para vigilantes |
| Validade do registro | Deve estar válido (renovação a cada 5 anos) |
| Treinamento inicial | 120 horas (conforme Lei 7.102/83) |
| Reciclagem | A cada 2 anos |
| Idade máxima | 70 anos (aposentadoria compulsória) |
| Exame toxicológico | Admissional e periódico |

### 5.2 Restrições por Tipo de Serviço

| Serviço | Requisitos Especiais |
|---------|---------------------|
| Vigilância armada | Registro arma, treinamento NR-20 |
| Escolta armada | Habilitação especial, treinamento tático |
| Portaria | Treinamento de atendimento ao público |
| Ronda motorizada | CNH categoria A ou B, CFC válido |
| Monitoramento CFTV | Treinamento em operação de CFTV |

### 5.3 Conformidade

- **Lei 7.102/83**: Lei das empresas de segurança privada
- **Portaria 1.003/2009**: Regulamento técnico para empresas de segurança
- **NR-7**: ASO obrigatório
- **NR-35**: Trabalho em altura (quando aplicável)
- **CLT**: Legislação trabalhista
- **eSocial**: Obrigação de envio

---

## 6. Integrações Externas

| Sistema | Tipo | Descrição |
|---------|------|-----------|
| **eSocial** | Obrigatório | Envio de eventos trabalhistas |
| **Banco** | Pagamento | Arquivo de pagamento (PIX/DOC) |
| **Rep de Ponto** | Futuro | Integração com relógio de ponto eletrônico |
| **CFTV** | Futuro | Integração com sistemas de monitoramento |
| **WhatsApp** | Futuro | Notificações via WhatsApp Business API |

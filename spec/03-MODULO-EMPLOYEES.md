# SPEC - Módulo 02: Gestão de Colaboradores

## 1. Visão Geral

Módulo completo de gestão do colaborador CLT, desde a admissão até a demissa, incluindo dados pessoais, documentos, dependentes, alocação em postos e histórico.

---

## 2. Funcionalidades

### 2.1 Cadastro de Colaborador

| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| Nome completo | ✅ | Nome civil |
| Nome social | ❌ | Para pessoas trans |
| CPF | ✅ | Único no sistema |
| RG + Órgão | ✅ | Com validade |
| Data de nascimento | ✅ | Calcula idade automaticamente |
| Sexo | ✅ | MASCULINO, FEMININO, OUTRO |
| Estado civil | ✅ | SOLTEIRO, CASADO, DIVORCIADO, VIUVO |
| Nacionalidade | ✅ | Default: Brasileira |
| E-mail | ✅ | Pessoal ou corporativo |
| Telefone | ✅ | Celular obrigatório |
| Endereço completo | ✅ | Rua, número, bairro, cidade, UF, CEP |
| Banco/Dados bancários | ✅ | Para pagamento |
| PIS/PASEP | ✅ | Cadastro social |
| CTPS | ✅ | Número, série, UF |
| Foto 3x4 | ✅ | Upload de imagem |
| Data de admissão | ✅ | Data de início |
| Matrícula | ✅ | Gerada automaticamente ou informada |
| Empresa (Grupo) | ✅ | Spark, Uniforce ou Cratos |
| Departamento | ✅ | Vinculado à empresa |

### 2.2 Gestão de Documentos

| Tipo de Documento | Validade | Obrigatório |
|-------------------|----------|:-----------:|
| CPF | — | ✅ |
| RG | Sim | ✅ |
| CTPS | — | ✅ |
| Comprovante de residência | 3 meses | ✅ |
| Certidão de nascimento/casamento | — | ✅ |
| Título de eleitor | — | ✅ |
| Certificado militar | — | Homens |
| Foto 3x4 | — | ✅ |
| Diploma/Certificado | — | ❌ |
| PIS/PASEP | — | ✅ |

### 2.3 Gestão de Dependentes

- Cadastro de dependentes (cônjuge, filhos, pais)
- Controle de dependentes para IRRF e Salário Família
- Limite de dependentes: 10
- Campos: nome, CPF, data nascimento, parentesco

### 2.4 Status do Colaborador

| Status | Descrição | Ações permitidas |
|--------|-----------|-------------------|
| ATIVO | Trabalhando normalmente | Todos |
| AFASTADO | Afastamento temporário (INSS, licença) | Consulta |
| FERIAS | Em gozo de férias | Consulta |
| DEMITIDO | Desligado | Apenas consulta (histórico) |

### 2.5 Histórico do Colaborador

Timeline visual com todas as ocorrências:
- Admissão
- Alterações salariais
- Alocações em postos
- Treinamentos realizados
- ASOs
- Férias
- Afastamentos
- Ocorrências
- Demissão

---

## 3. Endpoints da API

### Colaboradores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/employees` | Listar colaboradores (filtros, paginação) |
| POST | `/api/v1/employees` | Criar colaborador |
| GET | `/api/v1/employees/:id` | Buscar colaborador completo |
| PUT | `/api/v1/employees/:id` | Atualizar colaborador |
| DELETE | `/api/v1/employees/:id` | Desativar colaborador |
| GET | `/api/v1/employees/:id/history` | Timeline de ocorrências |
| POST | `/api/v1/employees/:id/photo` | Upload de foto |
| GET | `/api/v1/employees/:id/documents` | Listar documentos |
| POST | `/api/v1/employees/:id/documents` | Upload de documento |
| DELETE | `/api/v1/employees/:id/documents/:docId` | Remover documento |

### Dependentes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/employees/:id/dependents` | Listar dependentes |
| POST | `/api/v1/employees/:id/dependents` | Adicionar dependente |
| PUT | `/api/v1/employees/:id/dependents/:depId` | Atualizar dependente |
| DELETE | `/api/v1/employees/:id/dependents/:depId` | Remover dependente |

### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/employees/report/general` | Relatório geral de colaboradores |
| GET | `/api/v1/employees/report/birthday` | Aniversariantes do mês |
| GET | `/api/v1/employees/report/admissions` | Admissões do período |
| GET | `/api/v1/employees/report/resignations` | Demissões do período |

---

## 4. Filtros de Busca

O endpoint `GET /api/v1/employees` aceita os seguintes filtros:

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `search` | string | Busca por nome, CPF, matrícula |
| `status` | enum | ATIVO, AFASTADO, FERIAS, DEMITIDO |
| `companyId` | UUID | Filtrar por empresa do grupo |
| `departmentId` | UUID | Filtrar por departamento |
| `postId` | UUID | Filtrar por posto alocado |
| `admissionAfter` | date | Admissão após data |
| `admissionBefore` | date | Admissão antes data |
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 20) |
| `orderBy` | string | Campo de ordenação |
| `order` | enum | ASC, DESC |

---

## 5. Matrícula Automática

O sistema gera matrícula automática no formato:

```
[ANO_ADMISSAO][EMPRESA][SEQUENCIAL]

Exemplos:
2026SPK0001  → Admitido em 2026, Spark, nº 0001
2026UNI0001  → Admitido em 2026, Uniforce, nº 0001
2026CRA0001  → Admitido em 2026, Cratos, nº 0001
```

---

## 6. Validações

### CPF
- Validação de dígitos verificadores
- Unicidade no sistema
- Formato: XXX.XXX.XXX-XX

### Data de Admissão
- Não pode ser no futuro
- Não pode ser anterior à data de nascimento + 14 anos
- Colaborador não pode ter 2 admissões ativas

### Documentos
- RG deve ter validade (se informada)
- Comprovante de residência: máximo 3 meses
- Upload máximo: 10MB por arquivo
- Formatos aceitos: PDF, JPG, PNG

---

## 7. Integrações

| Integração | Descrição |
|------------|-----------|
| **Módulo de Contratos** | Verificar se posto tem vagas disponíveis |
| **Módulo de Escalas** | Verificar disponibilidade do colaborador |
| **Módulo de Treinamentos** | Alertar sobre certificados vencidos |
| **Módulo de ASO** | Alertar sobre ASOs vencidos/vencendo |
| **Módulo de Folha** | Dados para cálculo de pagamento |

# Estimativa de Projeto - Spark RH & DP Portal

## Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Cliente** | Spark Vigilância e Segurança |
| **Sistema** | Spark RH & DP Portal |
| **Stack** | React + NestJS + PostgreSQL + Prisma + React Native + N8N |
| **Data da Estimativa** | Julho 2026 |
| **Versão** | 1.0 |

---

## 1. Resumo Geral

| Métrica | Valor |
|---------|-------|
| **Total de telas** | 52 web + 17 mobile = **69 telas** |
| **Total de endpoints API** | **183 endpoints** |
| **Tabelas no banco** | **33 tabelas** |
| **Módulos** | 15 módulos funcionais |
| **Esforço total estimado** | **214 a 269 dias-dev** (com 20% buffer) |

---

## 2. Esforço por Módulo

| # | Módulo | Dias-dev | Complexidade | Prioridade |
|---|--------|:--------:|:------------:|:----------:|
| 1 | Auth & Acesso (CPF + SMS/WhatsApp) | 10-12 | Média | Fase 1 |
| 2 | Gestão de Colaboradores (CLT) | 12-15 | Média-Alta | Fase 1 |
| 3 | Contratos & Postos de Trabalho | 18-22 | Alta | Fase 1 |
| 4 | Escalas de Trabalho | 15-18 | Alta | Fase 1 |
| 5 | Ponto & Espelho (Web) | 10-12 | Média-Alta | Fase 1 |
| 6 | Treinamentos & ASO | 10-12 | Média | Fase 1 |
| 7 | App Mobile (Ponto GPS + Biometria) | 15-18 | Muito Alta | Fase 2 |
| 8 | App Mobile (RH/DP + Menu) | 8-10 | Média | Fase 2 |
| 9 | Espelho de Ponto + Cálculo de Horas | 12-15 | Alta | Fase 2 |
| 10 | Folha de Pagamento CLT (completa) | 22-28 | Muito Alta | Fase 2 |
| 11 | Férias & Afastamentos | 8-10 | Média-Alta | Fase 2 |
| 12 | Uniformes & EPIs | 6-8 | Média | Fase 2 |
| 13 | Motoristas & Veículos | 5-7 | Baixa | Fase 2 |
| 14 | Benefícios (VR, VT, etc.) | 5-7 | Média | Fase 2 |
| 15 | BI & Relatórios (dashboards + 20 relatórios) | 18-22 | Alta | Fase 3 |
| 16 | Ocorrências | 5-7 | Baixa | Fase 3 |
| 17 | Exportação eSocial | 8-12 | Alta | Fase 3 |
| 18 | Agente Spark N8N (WhatsApp/SMS) | 12-15 | Média-Alta | Fase 4 |
| -- | **Setup infra + DevOps** | 8-10 | -- | Fase 1 |
| -- | **Testes unitários + integração** | 25-35 | -- | Contínuo |
| -- | **TOTAL** | **214-269** | -- | -- |

---

## 3. Composição do Time

| Perfil | Qtd | Responsável por | Custo Mensal Estimado |
|--------|:---:|-----------------|:---------------------:|
| **Full-stack Senior** (líder técnico) | 1 | Arquitetura, folha CLT, escalas, decisões técnicas | R$ 16.000-22.000 |
| **Backend Mid/Senior** | 2 | APIs, regras de negócio, testes | R$ 10.000-16.000 |
| **Frontend Mid** | 1-2 | Web (React + Preline + Tailwind) | R$ 8.000-14.000 |
| **Mobile Mid** | 1 | App React Native (ponto + RH) | R$ 10.000-14.000 |
| **QA/Tester** | 1 | Testes, validação CLT, homologação | R$ 7.000-10.000 |

**Time ideal: 5 pessoas | Custo mensal do time: R$ 50.000-75.000**

---

## 4. Cronograma por Fases

### FASE 1 - MVP (Meses 1 a 3)

| Entrega | Descrição |
|---------|-----------|
| **Auth** | Login CPF + senha, recuperação SMS/WhatsApp, 5 perfis de acesso |
| **Colaboradores** | Cadastro completo CLT, documentos, dependentes, histórico |
| **Contratos & Postos** | Gestão de clientes, contratos, postos de trabalho, alocações |
| **Escalas** | Montagem de escalas por posto, calendário, geração automática |
| **Ponto (Web)** | Marcação de ponto via navegador, espelho básico |
| **Treinamentos & ASO** | Cadastro, validade, alertas de vencimento |
| **Infraestrutura** | Banco de dados, Docker, CI/CD, ambiente de staging |

**Prazo:** 3 meses | **Investimento:** R$ 80.000 - R$ 120.000

### FASE 2 - Expansão (Meses 4 a 6)

| Entrega | Descrição |
|---------|-----------|
| **App Mobile - Ponto** | Marcação GPS + biometria/facial, histórico, status turno |
| **App Mobile - RH/DP** | Escala, holerite, dados pessoais, solicitações |
| **Espelho de Ponto** | Cálculo de HE (50%/100%), adicional noturno, atrasos |
| **Folha de Pagamento** | Cálculo CLT completo (INSS, IRRF, FGTS), adiantamento + fechamento |
| **Férias & Afastamentos** | Programação, cálculo, histórico |
| **Uniformes & EPIs** | Estoque, distribuição, devolução |
| **Motoristas & Veículos** | CNH, CFC, frota, alertas |
| **Benefícios** | VR, VT, plano de saúde, cálculo proporcional |

**Prazo:** 3 meses | **Investimento:** R$ 70.000 - R$ 100.000

### FASE 3 - Inteligência (Meses 7 a 8)

| Entrega | Descrição |
|---------|-----------|
| **Dashboard Executivo** | KPIs consolidados, alertas, evolução de custos |
| **BI - Absenteísmo** | Taxa de faltas, atestados, afastamentos |
| **BI - Turnover** | Taxa de rotividade, admissões, demissões |
| **BI - Horas Extras** | HE por posto/colaborador, custo |
| **BI - Custo** | Custo por cliente/posto, margem, receita |
| **BI - Ponto** | Marcações, pontualidade, irregularidades |
| **Ocorrências** | Registro, acompanhamento, relatórios |
| **Exportação eSocial** | XML eventos S-1200, S-1210, S-1299, S-1202 |
| **20 Relatórios** | PDF/XLSX com filtros dinâmicos |

**Prazo:** 2 meses | **Investimento:** R$ 40.000 - R$ 60.000

### FASE 4 - Automação (Meses 9 a 10)

| Entrega | Descrição |
|---------|-----------|
| **Agente Spark N8N** | Assistente WhatsApp/SMS/App |
| **Solicitação de EPI** | Fluxo completo via agente + aprovação |
| **Consulta espelho** | Resumo + PDF via mensagem |
| **Ajuste de ponto** | Solicitação + aprovação supervisor/RH |
| **Notificações automáticas** | Alertas ASO, treinamento, contrato vencendo |
| **Integrações finais** | Webhooks, APIs externas |

**Prazo:** 2 meses | **Investimento:** R$ 30.000 - R$ 50.000

---

## 5. Resumo Financeiro

### Por Fases

| Fase | Prazo | Valor |
|------|:-----:|:-----:|
| Fase 1 - MVP | 3 meses | R$ 80.000 - R$ 120.000 |
| Fase 2 - Expansão | 3 meses | R$ 70.000 - R$ 100.000 |
| Fase 3 - Inteligência | 2 meses | R$ 40.000 - R$ 60.000 |
| Fase 4 - Automação | 2 meses | R$ 30.000 - R$ 50.000 |
| **TOTAL** | **10 meses** | **R$ 220.000 - R$ 330.000** |

### Valores de Referência por Modelo

| Modelo | Cálculo | Valor Estimado |
|--------|---------|:--------------:|
| **Fixed price (projeto)** | 214-269 dias × R$ 800-1.200/dia-dev | R$ 170k a R$ 320k |
| **Equipe dedicada/mês** | 5 devs × R$ 12-18k/mês × 10 meses | R$ 300k a R$ 500k |
| **Valor de mercado (sistema customizado)** | Benchmark sistemas RH/DP segmento segurança | R$ 150k a R$ 350k |

---

## 6. Custos Mensais Recorrentes (Pós-Entrega)

| Item | Custo Mensal | Observação |
|------|:------------:|------------|
| **Hospedagem (AWS/DigitalOcean)** | R$ 500 - R$ 2.000 | Servidor + banco + S3 |
| **Domínio + SSL** | R$ 50 - R$ 100 | Anual |
| **WhatsApp Business API** | R$ 200 - R$ 500 | Por número ativo |
| **SMS (Twilio/Vonage)** | R$ 100 - R$ 300 | Por mensagem enviada |
| **N8N (self-hosted ou cloud)** | R$ 0 - R$ 500 | Open-source ou plano pago |
| **Manutenção + Suporte** | R$ 5.000 - R$ 10.000 | Evolução corretiva e adaptativa |
| **TOTAL mensal pós-entrega** | **R$ 5.850 - R$ 13.400** | |

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:-------------:|:-------:|-----------|
| Erros em cálculos CLT (tabelas mudam anualmente) | Média | Crítico | Suite de testes com cenários conhecidos; validar contra holerites reais |
| Bugs no algoritmo de escala | Alta | Alto | Começar com 12x36 simples; expandir gradualmente; calendário visual para verificação |
| Falhas GPS/biometria no app | Alta | Alto | Fallback para ponto web com aprovação do supervisor; fila offline |
| Atraso na aprovação do WhatsApp Business | Média | Médio | MVP com SMS only; adicionar WhatsApp após aprovação |
| Scope creep (15 módulos) | Alta | Alto | Definição rigorosa de MVP; fases 1-2 primeiro; BI/N8N em fases posteriores |
| Mudança de tabelas CLT/IRRF | Certa | Médio | Tabelas configuráveis no banco; atualização anual como serviço adicional |

---

## 8. Fluxograma de Entregas

```
Mês 1          Mês 2          Mês 3          Mês 4          Mês 5          Mês 6
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│              │              │              │              │              │
│  FASE 1 - MVP                                             │
│  ████████████████████████████                              │
│              │              │              │              │              │
│  Auth        Colaboradores  Contratos     Escalas        Ponto Web     Treinamentos
│  DB Schema   Docs upload    Postos        Calendar       Espelho basic ASO
│  DevOps      Filtros        Alocações     Geração auto   Dashboard     Alertas
│              │              │              │              │              │
│              │              │              │  FASE 2 - EXPANSÃO          │
│              │              │              │  ████████████████████████████│
│              │              │              │  App Mobile     Folha CLT    Férias
│              │              │              │  Ponto GPS      INSS/IRRF    Uniformes
│              │              │              │  Biometria      FGTS/HE      Veículos
│              │              │              │  Escala app     Adiantamento  Benefícios
│              │              │              │              │              │
│              │              │              │              │              │
│              ▼              ▼              ▼              ▼              ▼
│         HOMOLOGAÇÃO MVP        │         HOMOLOGAÇÃO FASE 2           │
│         (teste cliente)        │         (teste cliente)              │
│                                │                                      │
Mês 7          Mês 8          Mês 9          Mês 10
├──────────────┼──────────────┼──────────────┤
│              │              │              │
│  FASE 3 - INTELIGÊNCIA        │              │
│  ████████████████████████████ │              │
│              │              │              │
│  BI Dash     Relatórios    eSocial        │
│  Absenteísmo 20 relatórios XML            │
│  Turnover    PDF/XLSX       Validação     │
│  HE/Custo    Filtros dinâm.               │
│              │              │              │
│              │  FASE 4 - AUTOMAÇÃO        │
│              │  ████████████████████████████
│              │              │              │
│              │              Agente N8N     Notificações
│              │              WhatsApp      Integrações
│              │              EPI + Ponto   Finais
│              │              │              │
│              ▼              ▼              ▼
│         HOMOLOGAÇÃO FASE 3      HOMOLOGAÇÃO FASE 4
│         (teste cliente)         (teste cliente)
│                                 │
│                                 ▼
│                            ENTREGA FINAL
│                            GO-LIVE
```

---

## 9. Escopo Excluído

| Item | Motivo |
|------|--------|
| Portal para clientes externos | Escopo apenas interno |
| Sistema financeiro (PDR) | Fora do domínio de RH/DP |
| CRM / Vendas | Não pertence ao escopo |
| App do cliente | Acesso apenas interno |
| Integração com outros ERPs | Pode ser fase futura |

---

## 10. Condições Comerciais

| Item | Condição |
|------|----------|
| **Forma de pagamento** | 30% na assinatura + 30% ao final da Fase 1 + 30% ao final da Fase 2 + 10% na entrega final |
| **Escopo** | Definido por fase, com document formal de alteração para mudanças |
| **Reajuste** | Tabelas CLT/IRRF atualizadas anualmente (serviço adicional) |
| **Propriedade intelectual** | Código fonte pertence ao cliente após pagamento integral |
| **Suporte pós-entrega** | Contrato de manutenção mensal (R$ 5-10k/mês) |
| **Garantia** | 90 dias para correção de bugs sem custo adicional |

---

## 11. Próximos Passos

1. ✅ Aprovação do cliente sobre escopo e fases
2. 📝 Assinatura de contrato com valores e prazos definidos
3. 🏗️ Início da Fase 1 (MVP)
4. 🔄 Entregas incrementais a cada 2 semanas (sprints)
5. 🧪 Homologação com a equipe Spark ao final de cada fase
6. 🚀 Go-live da Fase 1 para uso interno
7. 📈 Evolução contínua nas fases seguintes

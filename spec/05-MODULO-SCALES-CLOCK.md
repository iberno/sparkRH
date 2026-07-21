# SPEC - Módulo 04: Escalas de Trabalho & Controle de Ponto

## 1. Visão Geral

Módulo responsável pela geração de escalas de trabalho, marcação de ponto (web e app mobile), espelho de ponto e cálculo de horas para alimentação da folha de pagamento.

---

## 2. Geração de Escalas

### 2.1 Processo de Geração

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Supervisor   │────▶│ Seleciona    │────▶│ Sistema      │
│ acessa       │     │ posto +     │     │ gera escala  │
│ módulo       │     │ período     │     │ automaticam. │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                    ┌─────────────▼─────────┐
                                    │ Verifica:              │
                                    │ - Vagas disponíveis    │
                                    │ - Conflitos de horário │
                                    │ - Documentos válidos   │
                                    └─────────────┬─────────┘
                                                  │
                                    ┌─────────────▼─────────┐
                                    │ Escala gerada com      │
                                    │ status PROGRAMADO      │
                                    └───────────────────────┘
```

### 2.2 Configuração da Geração

| Parâmetro | Descrição |
|-----------|-----------|
| Posto | Selecionar o posto de trabalho |
| Período | Data início e fim da escala |
| Escala padrão | Usar escala padrão do posto ou personalizada |
| Colaboradores | Selecionar colaboradores para o período |
| Regras especiais | Feriados, férias, afastamentos |

### 2.3 Regras de Geração Automática

1. Respeitar o ciclo da escala padrão do posto
2. Distribuir turnos igualmente entre colaboradores
3. Respeitar descanso semanal remunerado (mínimo 24h consecutivas)
4. Não gerar conflitos (mesmo colaborador em 2 postos no mesmo turno)
5. Verificar ASO válido
6. Verificar treinamentos obrigatórios vencidos
7. Respeitar limite máximo de 44h semanais (CLT)

### 2.4 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/schedules` | Listar escalas geradas |
| POST | `/api/v1/schedules/generate` | Gerar escala para período |
| PUT | `/api/v1/schedules/:id` | Alterar escala individual |
| DELETE | `/api/v1/schedules/:id` | Remover escala |
| POST | `/api/v1/schedules/bulk-update` | Atualização em massa |
| GET | `/api/v1/schedules/calendar` | Visualização calendário |
| GET | `/api/v1/schedules/conflicts` | Listar conflitos |

---

## 3. Controle de Ponto

### 3.1 Fontes de Marcação

| Fonte | Descrição |
|-------|-----------|
| **Web** | Ponto pelo navegador (para quem trabalha em escritório) |
| **Mobile** | App React Native (para vigilantes em campo) |
| **REP** | Relógio de ponto eletrônico (integração futura) |

### 3.2 Tipos de Marcação

| Tipo | Descrição |
|------|-----------|
| ENTRADA | Início do expediente |
| SAIDA | Término do expediente |
| ALMOCO_SAIDA | Saída para intervalo |
| ALMOCO_RETORNO | Retorno do intervalo |

### 3.3 Marcação via App Mobile

```
┌─────────────────────────────────────────┐
│              APP MOBILE                  │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Bom dia, João!                   │   │
│  │  Posto: Edifício Central          │   │
│  │  Turno: Manha (06:00 - 18:00)    │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │     ┌──────────────────┐        │   │
│  │     │                  │        │   │
│  │     │   MARCAR PONTO   │        │   │
│  │     │                  │        │   │
│  │     └──────────────────┘        │   │
│  │                                  │   │
│  │  Última marcação: 06:02         │   │
│  │  Status: ✓ Ponto registrado     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Histórico de Hoje               │   │
│  │  ────────────────────────        │   │
│  │  06:02  ENTRADA     ✓           │   │
│  │  12:00  ALMOCO_SAIDA ✓          │   │
│  │  13:00  ALMOCO_RETORNO ✓        │   │
│  │  18:00  SAIDA       --          │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

### 3.4 Validações na Marcação

| Validação | Descrição |
|-----------|-----------|
| **GPS** | Colaborador deve estar dentro do raio configurado no posto (default: 100m) |
| **Biometria/Facial** | Autenticação biométrica ou reconhecimento facial |
| **Horário** | Marcação não pode ser muito antes/depois do turno (tolerância: 15min) |
| **Sequência** | ENTRADA → ALMOCO_SAIDA → ALMOCO_RETORNO → SAIDA |
| **Duplicidade** | Não permite 2 marcações do mesmo tipo com < 30min de diferença |
| **Conflito** | Não pode marcar ponto em 2 postos diferentes no mesmo período |

### 3.5 Endpoints - Ponto

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/time-clocks` | Registrar marcação de ponto |
| GET | `/api/v1/time-clocks` | Listar marcações (filtros) |
| GET | `/api/v1/time-clocks/my` | Marcações do colaborador logado |
| PUT | `/api/v1/time-clocks/:id/approve` | Aprovar marcação irregular |
| POST | `/api/v1/time-clocks/:id/justify` | Justificar irregularidade |
| GET | `/api/v1/time-clocks/irregularities` | Listar irregularidades |

### 3.6 Marcação pela Web

```
┌─────────────────────────────────────────────────────┐
│                    PONTO WEB                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Colaborador seleciona:                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ Posto: [Selecionar posto ▼]                   │   │
│  │ Turno: [Manha ▼]                              │   │
│  │                                               │   │
│  │        ┌──────────────────────┐              │   │
│  │        │    MARCAR ENTRADA    │              │   │
│  │        └──────────────────────┘              │   │
│  │                                               │   │
│  │  ⚠️ Atenção: O ponto web é registrado sem    │   │
│  │  validação de GPS. Irregularidades serão     │   │
│  │  sinalizadas para aprovação do supervisor.   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 4. Espelho de Ponto

### 4.1 Conceito

O espelho de ponto é o resumo consolidado das marcações de um colaborador em um período (mensal), utilizado para:

- Visualizar todos os registros de ponto
- Calcular horas trabalhadas
- Identificar irregularidades
- Calcular horas extras
- Calcular adicional noturno
- Servir de base para cálculo da folha

### 4.2 Layout do Espelho

```
┌─────────────────────────────────────────────────────────────┐
│                    ESPELHO DE PONTO                          │
│  Colaborador: João da Silva (2026SPK0001)                    │
│  Posto: Edifício Central - Portaria                          │
│  Período: 01/07/2026 a 31/07/2026                           │
├─────┬────────┬───────┬────────┬────────┬────────┬──────────┤
│ Dia │ Data   │ Ent.  │ Alm.Sa │ Alm.Ret│ Saída  │ Obs      │
├─────┼────────┼───────┼────────┼────────┼────────┼──────────┤
│ Seg │ 01/07  │ 06:02 │ 12:00  │ 13:01  │ 18:03  │          │
│ Ter │ 02/07  │ 05:58 │ 12:00  │ 13:00  │ 18:05  │          │
│ Qua │ 03/07  │ 06:15 │ 12:00  │ 13:00  │ 18:00  │ 15min    │
│ Qui │ 04/07  │ ---   │ ---    │ ---    │ ---    │ FALTA    │
│ Sex │ 05/07  │ 06:00 │ 12:00  │ 13:02  │ 18:10  │          │
│ Sáb │ 06/07  │ ---   │ ---    │ ---    │ ---    │ DESCANSO │
│ Dom │ 07/07  │ 06:00 │ 12:00  │ 13:00  │ 18:00  │          │
├─────┴────────┴───────┴────────┴────────┴────────┴──────────┤
│                                                              │
│  RESUMO DO PERÍODO                                           │
│  ──────────────────────────────────────                      │
│  Horas Trabalhadas:        196,00h                           │
│  Horas Extras (50%):       12,00h     → R$ 450,00           │
│  Horas Extras (100%):       4,00h     → R$ 300,00           │
│  Adicional Noturno:        20,00h     → R$ 200,00           │
│  Dias de Falta:             1 dia                           │
│  Atrasos:                   1 (15min)                        │
│  Abonos:                    0                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Cálculos do Espelho

#### Horas Trabahadas
```
Total = Σ (Saída - Entrada) - Σ (Almoco Retorno - Almoco Saída)
```

#### Horas Extras
- **Até 2h extras/dia**: 50% (adicional legal)
- **Acima de 2h extras/dia ou domingos/feriados**: 100%
- **Limite**: 2h extras/dia (Art. 59 CLT)

#### Adicional Noturno
- **Horário**: 22h às 05h
- **Adicional**: 20% sobre hora noturna
- **Hora noturna reduzida**: 52min30s (urbano)

#### Atrasos
- Descontado proporcionalmente
- Tolerância de 15min (configurável)

### 4.4 Endpoints - Espelho

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/time-sheets` | Listar espelhos |
| GET | `/api/v1/time-sheets/:id` | Buscar espelho completo |
| POST | `/api/v1/time-sheets/calculate` | Calcular espelho do período |
| PUT | `/api/v1/time-sheets/:id/approve` | Aprovar espelho |
| GET | `/api/v1/time-sheets/my` | Espelho do colaborador logado |
| GET | `/api/v1/time-sheets/:id/pdf` | Gerar PDF do espelho |

---

## 5. App Spark (Único) - Especificações

### 5.1 Modelo: 1 App + Web Complementar

O **App Spark** é um aplicativo único que concentra TODAS as funcionalidades do colaborador:
- **Ponto** (GPS + biometria/facial) — funcionalidade principal
- **RH/DP** (escala, holerite, espelho, EPI, férias, etc.)
- **Agente Spark** (assistente via N8N para consultas e solicitações)

O acesso **web** (desktop) é complementar para quem está no computador, com as mesmas funcionalidades do módulo RH/DP do app.

### 5.2 Abas do App

```
┌─────────────────────────────────────────┐
│              APP SPARK                   │
├─────────────────────────────────────────┤
│                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐ │
│  │ PONTO │ │ ESCALA│ │ MENU  │ │ AGENTE│ │
│  │  ⏰   │ │  📋   │ │  ☰   │ │  🤖  │ │
│  └───────┘ └───────┘ └───────┘ └─────┘ │
│                                          │
│  Aba PONTO:                              │
│  ├── Marcar ponto (entrada/saída)        │
│  ├── Histórico de marcações              │
│  └── Status do turno atual               │
│                                          │
│  Aba ESCALA:                             │
│  ├── Escala do mês (calendário)          │
│  ├── Próximos turnos                     │
│  └── Minhas férias programadas           │
│                                          │
│  Aba MENU (RH/DP):                       │
│  ├── Meus dados pessoais                 │
│  ├── Holerite / Contracheque             │
│  ├── Espelho de ponto                    │
│  ├── Solicitar EPI / Uniforme            │
│  ├── Meus treinamentos                   │
│  ├── Meus ASOs                           │
│  ├── Férias e afastamentos               │
│  ├── Benefícios (VR, VT, etc.)           │
│  ├── Solicitar ajuste de ponto           │
│  └── Notificações                        │
│                                          │
│  Aba AGENTE SPARK:                       │
│  ├── Chat com assistente N8N             │
│  ├── Solicitar EPI rápido                │
│  ├── Consultar espelho de ponto          │
│  ├── Solicitar ajuste (com aprovação)    │
│  └── Dúvidas frequentes                  │
│                                          │
└─────────────────────────────────────────┘
```

### 5.3 Funcionalidades Detalhadas

| Aba | Funcionalidade | Descrição |
|-----|---------------|-----------|
| **PONTO** | Marcar ponto | GPS + biometria/facial, validação de raio |
| **PONTO** | Histórico | Últimas 30 marcações com status |
| **PONTO** | Status turno | Turno atual, horas trabalhadas, próxima marcação |
| **ESCALA** | Calendário | Visualização mensal com turnos |
| **ESCALA** | Próximos turnos | Lista dos próximos 7 dias |
| **MENU** | Meus dados | Visualizar e solicitar alteração |
| **MENU** | Holerite | Download PDF do mês atual |
| **MENU** | Espelho ponto | Detalhamento de marcações |
| **MENU** | Solicitar EPI | Formulário simples via Agente |
| **MENU** | Treinamentos | Status e certificados |
| **MENU** | Ajuste ponto | Solicitar com justificativa |
| **AGENTE** | Chat | Conversa com Agente Spark (N8N) |

### 5.4 Tecnologias

- **React Native** com Expo
- **Biometria**: `expo-local-authentication`
- **Câmera**: `expo-camera` (reconhecimento facial)
- **GPS**: `expo-location`
- **Push Notifications**: `expo-notifications`
- **Chat**: Componente de chat integrado (WebSocket)

### 5.5 Login no App

```
┌─────────────────────────────────────────┐
│              LOGIN SPARK                 │
├─────────────────────────────────────────┤
│                                          │
│         ⚡ SPARK RH & DP                 │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  CPF                               │  │
│  │  [___] . [___] . [___] - [__]     │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  Senha                             │  │
│  │  [••••••••••]                      │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │         ENTRAR                     │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  🔑 Primeiro acesso? Clique aqui  │  │
│  │  📱 Esqueci minha senha            │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  📱 Login com Biometria/Facial    │  │
│  └───────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### 5.6 Segurança do App

- Biometria ou PIN para abrir o app (opcional)
- Token JWT com expiração curta (15min)
- Bloqueio após 3 tentativas incorretas
- Sessão expira após 8h (novo login necessário)
- Logs de todas as ações
- GPS obrigatório para marcação de ponto
- Reconhecimento facial para autenticação biométrica

---

## 6. Regras de Negócio

### 6.1 Marcação de Ponto

1. **Tolerância de atraso**: 15min (configurável por posto)
2. **Intervalo para almoço**: Mínimo 1h, máximo 2h
3. **Jornada máxima**: 8h/dia, 44h/semana (CLT)
4. **DSR**: Mínimo 24h consecutivas por semana
5. **Horário noturno**: 22h às 05h (adicional 20%)
6. **Ponto não marcado**: Considerado falta (exceto justificado)
7. **Justificativa**: Pode ser feita em até 5 dias úteis após a ocorrência

### 6.2 Espelho de Ponto

1. Período de cálculo: Mensal (dia 1 ao último dia do mês)
2. Cálculo automático: Dia 1 do mês seguinte
3. Aprovação: Supervisor ou DP/RH
4. Colaborador pode visualizar e manifestar discordância em até 5 dias
5. Após aprovação, dados vão para cálculo da folha

### 6.3 Integração com Folha

```
Espelho Aprovado → Cálculo de Horas → Folha de Pagamento
                                        ├── Base salarial
                                        ├── Horas extras (50% / 100%)
                                        ├── Adicional noturno
                                        ├── Desconto de faltas
                                        └── Desconto de atrasos
```

---

## 7. Dashboard do Módulo

```
┌─────────────────────────────────────────────────────────┐
│                 DASHBOARD DE PONTO                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Marcações   │  │ Irregulari- │  │ Horas Extras│     │
│  │ Hoje        │  │ dades       │  │ Mês         │     │
│  │    285      │  │    12       │  │   320h      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Marcações por Hora (Hoje)                        │   │
│  │  06h ████████████ 180 marcações                   │   │
│  │  07h ████ 45                                        │   │
│  │  ...                                               │   │
│  │  18h ████████████ 175 marcações                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Top 5 Postos com Mais Irregularidades           │   │
│  │  1. Edifício Central     (5)                      │   │
│  │  2. Shopping Vila Velha  (3)                      │   │
│  │  3. Empresa XYZ          (2)                      │   │
│  │  4. Condomínio ABC       (1)                      │   │
│  │  5. Indústria DEF        (1)                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

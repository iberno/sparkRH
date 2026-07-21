# TODO - Implementação Spark RH & DP Portal

## Status: [x] = Concluído, [ ] = Pendente, [~] = Em andamento

---

## Fase 0 - Infraestrutura Base ✅

- [x] Criar estrutura de diretórios frontend
- [x] Criar `lib/` (api, formatters, validators, constants)
- [x] Criar `hooks/` (usePreline, useAuth, usePagination)
- [x] Criar `components/ui/` (Button, Input, Select, Card, Badge, Alert, Spinner, Pagination, Avatar, Toggle, Dropdown)
- [x] Criar `components/layout/` (AppLayout, AuthLayout, Sidebar, Navbar, ThemeToggle)
- [x] Criar `components/custom/` (StatusBadge, PageHeader, EmptyState, KPICard, FormField)
- [x] Reestruturar `pages/` por módulo (auth/, dashboard/)
- [x] Atualizar App.tsx com layout components (Outlet pattern)
- [x] Dark mode funcional (Zustand + localStorage)
- [x] Brand colors + Fontes aplicadas
- [x] TypeScript compila sem erros

---

## Fase 1 - Autenticação Completa

### Backend
- [x] `POST /auth/refresh` — Renovação de tokens
- [x] `POST /auth/logout` — Invalidação de sessão
- [x] `POST /auth/forgot-password` — Enviar código SMS/WhatsApp
- [x] `POST /auth/verify-code` — Verificar código de recuperação
- [x] `POST /auth/reset-password` — Redefinir senha com código
- [x] `POST /auth/first-access` — Primeiro acesso (CPF → código → nova senha)
- [x] `GET /auth/me` — Dados do usuário logado
- [x] `PUT /auth/change-password` — Alterar senha (com verificação SMS)
- [x] Rate limiting: 5 tentativas → bloqueio 30min
- [x] Rate limiting SMS: 3 envios/hora por CPF

### Frontend
- [x] `useAuthStore` suporta refresh token
- [x] `api.ts` interceptor renova token automaticamente
- [x] Página "Esqueci minha senha" (CPF → código → nova senha)
- [x] Página "Primeiro Acesso" (CPF → código → definir senha)
- [x] Página "Alterar Senha" (senha atual + nova senha)

---

## Fase 2 — Usuários (Admin)

### Backend
- [ ] `GET /users` — Listar usuários (paginado)
- [ ] `POST /users` — Criar usuário
- [ ] `GET /users/:id` — Buscar usuário
- [ ] `PUT /users/:id` — Atualizar usuário
- [ ] `DELETE /users/:id` — Desativar usuário (soft delete)
- [ ] `PUT /users/:id/permissions` — Atualizar permissões
- [ ] Audit logs CRUD

### Frontend
- [ ] Página Listagem Usuários (tabela + paginação)
- [ ] Página Criar/Editar Usuário
- [ ] Logs de Auditoria

---

## Fase 3 — Colaboradores (DP/RH)

### Backend
- [ ] CRUD Colaboradores (dados pessoais, documentos, contatos)
- [ ] Upload de documentos (ASO, certificados, etc.)
- [ ] Endereços (1:N)
- [ ] Contatos de emergência (1:N)
- [ ] Banco de horas (criação + saldo)

### Frontend
- [ ] Página Listagem Colaboradores
- [ ] Página Criar/Editar Colaborador
- [ ] Página Detalhes do Colaborador
- [ ] Upload de documentos

---

## Fase 4 — Contratos & Postos

### Backend
- [ ] CRUD Contratos (tipo, vigência, valores)
- [ ] CRUD Postos de Trabalho (endereço, horário, escalas)
- [ ] Alocação de colaboradores em postos
- [ ] Escalas por padrão (fixed/rotating)
- [ ] Contratos colaborador-posto

### Frontend
- [ ] Página Listagem Contratos
- [ ] Página Criar/Editar Contrato
- [ ] Página Listagem Postos
- [ ] Página Criar/Editar Posto
- [ ] Alocação de colaboradores

---

## Fase 5 — Escalas & Ponto

### Backend
- [ ] CRUD Escalas (templates)
- [ ] Escala fixa (mesma escala todo mês)
- [ ] Escala rotativa (4x2, 5x1, etc.)
- [ ] Escala anotada (mista fixa+rotativa)
- [ ] Registro de ponto (app mobile)
- [ ] Aprovação de horas extras
- [ ] Cálculo automático de HE

### Frontend
- [ ] Página Escalas
- [ ] Página Criar/Editar Escala
- [ ] Calendário de escalas
- [ ] Registro de ponto (mobile-first)
- [ ] Aprovação de HE

---

## Fase 6 — Folha de Pagamento

### Backend
- [ ] Cálculo automático de folha
- [ ] Vigilantes HE: valor fixo, no holerite, max 3 escalas/mês, com encargos
- [ ] Porteiros HE: valor fixo, pagamento separado, sem encargos
  - P1 (1-20): pago 20/M+1
  - P2 (21-31): pago 20/M+2
- [ ] Geração de holerites (PDF)
- [ ] Rescisão (aviso prévio, férias proporcionais, 13º proporcional)
- [ ] Férias (programação, Go Back, abono)
- [ ] 13º salário (1ª e 2ª parcela)

### Frontend
- [ ] Página Folha de Pagamento
- [ ] Página Rescisão
- [ ] Página Férias
- [ ] Download de holerites

---

## Fase 7 — Módulos Complementares

### Backend
- [ ] Treinamentos (O.S., certificados, validade)
- [ ] Veículos (alocação em postos)
- [ ] Equipamentos (arma, colete, algema, etc.)
- [ ] ASO (atestado de saúde ocupacional)
- [ ] Comunicação interna (notificações)
- [ ] Dashboard unificado (KPIs)

### Frontend
- [ ] Página Treinamentos
- [ ] Página Veículos
- [ ] Página Equipamentos
- [ ] Página ASO
- [ ] Página Comunicação
- [ ] Dashboard com KPIs reais

---

## Fase 8 — BI & Relatórios

### Backend
- [ ] Relatório de custo por posto
- [ ] Relatório de horas extras
- [ ] Relatório de absenteísmo
- [ ] Relatório de rotatividade
- [ ] Dashboard com métricas

### Frontend
- [ ] Página Relatórios
- [ ] Filtros avançados
- [ ] Exportação (PDF/Excel)

---

## Fase 9 — Mobile (React Native + Expo)

- [ ] Setup Expo + React Native
- [ ] Login mobile
- [ ] Registro de ponto
- [ ] Visualização de escala
- [ ] Download de holerite
- [ ] Notificações push

---

## Fase 10 — Infraestrutura & Deploy

- [ ] Docker Compose (PostgreSQL + Redis + Backend + Frontend)
- [ ] N8N para automações
- [ ] Deploy VPS (Ubuntu/CentOS)
- [ ] SSL/HTTPS
- [ ] Backup automático

---

## Commits realizados

1. `6ffd2f3` — CSS fix + DTO
2. `5dac608` — Lucide + dark mode
3. `31e69f7` — Tailwind v4 dark variant
4. `0481747` — Spark brand dark palette
5. `504f818` — brand colors
6. `96aec5c` — Frontend architecture per spec 13

---

## Pendências / Fixes

- [ ] Restaurar validação completa de CPF no frontend (`cpfFullSchema` já criado, trocar `cpfSchema` → `cpfFullSchema` nos forms de cadastro)

---

*Última atualização: 2026-07-21*

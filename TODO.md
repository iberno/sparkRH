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
- [x] `GET /users` — Listar usuários (paginado)
- [x] `POST /users` — Criar usuário
- [x] `GET /users/:id` — Buscar usuário
- [x] `PUT /users/:id` — Atualizar usuário
- [x] `DELETE /users/:id` — Desativar usuário (soft delete)
- [x] `PUT /users/:id/permissions` — Atualizar permissões
- [x] Audit logs CRUD

### Frontend
- [x] Página Listagem Usuários (tabela + paginação)
- [x] Página Criar/Editar Usuário
- [x] Logs de Auditoria

---

## Fase 3 — Colaboradores (DP/RH)

### Backend
- [x] CRUD Colaboradores (dados pessoais, documentos, contatos)
- [ ] Upload de documentos (ASO, certificados, etc.)
- [x] Endereços (1:N — integrado ao formulário)
- [x] Contatos de emergência (1:N)
- [x] Banco de horas (criação + saldo)
- [x] Stats de colaboradores (ativos, inativos, total)

### Frontend
- [x] Página Listagem Colaboradores (tabela + busca + filtro status + paginação)
- [x] Página Criar/Editar Colaborador (5 abas: dados pessoais, contato, endereço, banco, documentos + ViaCEP)
- [x] Página Detalhes do Colaborador (7 abas + cards de status)
- [ ] Upload de documentos

---

## Fase 4 — Contratos & Postos

### Backend
- [x] CRUD Contratos (tipo, vigência, valores, status flow)
- [x] CRUD Postos de Trabalho (endereço, código único, GPS, escalas)
- [x] Alocação de colaboradores em postos (validação conflitos/vagas)
- [x] Escalas por padrão (post_schedules com is_default)
- [x] CRUD Clientes (soft delete, tipo JURIDICA/FISICA)
- [x] Empresas (trade_name adicionado)

### Frontend
- [x] Página Listagem Contratos
- [x] Página Criar/Editar Contrato
- [x] Página Listagem Postos
- [x] Página Criar/Editar Posto
- [x] Página Listagem Clientes
- [x] Página Criar/Editar Cliente
- [x] Página Alocação de Colaboradores

---

## Fase 5 — Escalas & Ponto

### Backend
- [x] CRUD Escalas (templates)
- [x] Escala fixa (mesma escala todo mês)
- [x] Escala rotativa (4x2, 5x1, etc.)
- [x] Escala anotada (mista fixa+rotativa)
- [x] Registro de ponto (app mobile)
- [x] Aprovação de horas extras
- [x] Cálculo automático de HE

### Frontend
- [x] Página Escalas
- [x] Página Criar/Editar Escala
- [x] Calendário de escalas
- [x] Registro de ponto (mobile-first)
- [x] Aprovação de HE

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
- [x] Treinamentos (CRUD + vencimentos + stats)
- [x] Veículos (CRUD + alertas IPVA/seguro + stats)
- [x] Motoristas (CRUD + CNH/CFC alertas + stats)
- [x] ASO (CRUD + vencimentos + stats)
- [x] Ocorrências (CRUD + resolver + stats)
- [x] Dashboard unificado (KPIs + alertas vencidos)
- [ ] Equipamentos (arma, colete, algema, etc.)
- [ ] Comunicação interna (notificações)

### Frontend
- [x] Página Treinamentos (list + form)
- [x] Página Veículos (list + form)
- [x] Página Motoristas (list + form)
- [x] Página ASO (list + form)
- [x] Página Ocorrências (list + form)
- [x] Dashboard com KPIs reais + alertas
- [ ] Página Equipamentos
- [ ] Página Comunicação

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
7. `c10c426` — Fase 1 Auth completa (refresh, logout, forgot, reset, first-access, change-password)
8. `b305761` — Fase 2 Usuarios Admin (CRUD, permissions, audit logs)
9. `546b8b7` — Select UI fix (dark mode, form center)
10. `8301682` — 500 error fix (page/limit Number, exclude password_hash)
11. `b6448aa` — Fase 3 Colaboradores + PrelineSelect + Toastify spark theme
12. `829c04b` — docs: atualizar TODO.md com Fase 3 concluida e commits
13. `c95a7ee` — Fase 7 Treinamentos, ASO, Ocorrências, Veículos, Motoristas, Dashboard
14. `807848c` — fix: separar DriversController em /drivers
15. `c86bb1a` — Fase 4 Contratos, Postos, Clientes, Alocações

---

## Pendências / Fixes

- [ ] Restaurar validação completa de CPF no frontend (`cpfFullSchema` já criado, trocar `cpfSchema` → `cpfFullSchema` nos forms de cadastro)
- [ ] Upload de documentos (ASO, certificados) — backend + frontend
- [ ] Toastify: considerar tema light mode para o tema Spark (atualmente só dark)
- [ ] PrelineSelect: suporte a `clearable` (botão X para limpar seleção)

---

*Última atualização: 2026-07-22*

# SPEC - Módulo 01: Autenticação & Controle de Acesso

## 1. Visão Geral

Módulo responsável pela autenticação dos usuários, controle de acesso por perfis e auditoria de ações no sistema.

---

## 2. Funcionalidades

### 2.1 Autenticação

| Funcionalidade | Descrição |
|---------------|-----------|
| Login (Web/App) | **CPF** + senha com JWT |
| Refresh Token | Renovação automática do token (15min access / 7 dias refresh) |
| Logout | Invalidação do token no servidor |
| Recuperação de Senha | Código via **SMS / WhatsApp** (expira em 10min) |
| Alteração de Senha | Solicita senha atual + nova senha |
| Bloqueio por Tentativas | Bloqueia após 5 tentativas incorretas (30min) |
| Primeiro Acesso | Colaborador define senha via código SMS no primeiro login |

> **Nota**: Colaboradores fazem login com **CPF**. Gestores/DP/RH/Admin podem usar CPF ou e-mail.

### 2.2 Controle de Acesso (RBAC)

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **ADMIN** | Acesso total ao sistema | Todos os módulos, configurações, usuários |
| **MANAGER** | Gerente administrativo/operacional | Módulos da sua área + relatórios BI |
| **SUPERVISOR** | Supervisor de postos | Postos do seu setor, escalas, ocorrências |
| **DP_RH** | Departamento de Pessoal/RH | Colaboradores, ponto, folha, treinamentos, ASO |
| **EMPLOYEE** | Vigilante/colaborador | App mobile: ponto, escala, holerite |

### 2.3 Permissões por Módulo

Cada módulo pode ter 4 ações controladas:

| Ação | Descrição |
|------|-----------|
| `create` | Criar novos registros |
| `read` | Visualizar registros |
| `update` | Editar registros existentes |
| `delete` | Excluir registros (soft delete) |

---

## 3. Fluxos

### 3.1 Fluxo de Login (CPF + Senha)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Usuário     │────▶│  Frontend    │────▶│  API Auth    │
│  digita CPF  │     │  (React/App) │     │  /auth/login │
│  + senha     │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Busca usuário     │
                                        │ por CPF           │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Valida senha      │
                                        │ (bcrypt compare)  │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Gera JWT tokens   │
                                        │ access + refresh  │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Retorna tokens +  │
                                        │ dados do usuário  │
                                        └───────────────────┘
```

### 3.2 Fluxo de Primeiro Acesso (Senha Provisória)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Colaborador │────▶│  Insere CPF  │────▶│  API verifica│
│  abre app    │     │  (sem senha) │     │  primeiro    │
│              │     │              │     │  acesso      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Envia código SMS  │
                                        │ / WhatsApp (6 dígitos)
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Colaborador       │
                                        │ insere código     │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Define nova senha │
                                        │ (mín 8, maiúsc,   │
                                        │  minúsc, número)  │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Login automático  │
                                        │ com novos tokens  │
                                        └───────────────────┘
```

### 3.3 Fluxo de Refresh Token

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend│────▶│  API Auth    │     │  Valida      │
│  envia   │     │  /auth/      │────▶│  refresh     │
│  refresh │     │  refresh     │     │  token       │
└──────────┘     └──────────────┘     └──────┬───────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │ Gera novos tokens │
                                    └───────────────────┘
```

### 3.4 Fluxo de Recuperação de Senha (SMS / WhatsApp)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Usuário     │────▶│  Solicita    │────▶│  API valida  │
│  clica       │     │  recuperação │     │  CPF + gera  │
│  "esqueci"   │     │  (informa CPF│     │  código 6    │
│              │     │   + telefone)│     │  dígitos     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                              ┌────────────────────┼────────────────────┐
                              │                                         │
                    ┌─────────▼─────────┐                   ┌──────────▼──────────┐
                    │ Envia via SMS     │                   │ Envia via WhatsApp  │
                    │ (Twilio/Vonage)   │                   │ (WhatsApp Business) │
                    └─────────┬─────────┘                   └──────────┬──────────┘
                              │                                         │
                              └────────────────────┬────────────────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Colaborador       │
                                        │ insere código     │
                                        │ (expira em 10min) │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Define nova senha │
                                        └───────────────────┘
```

### 3.5 Fluxo de Alteração de Senha (via SMS/WhatsApp)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Usuário     │────▶│  Solicita    │────▶│  API envia   │
│  solicita    │     │  alteração   │     │  código via  │
│  alterar     │     │              │     │  SMS/WhatsApp│
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Insere código +   │
                                        │ nova senha        │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │ Senha atualizada  │
                                        │ Tokens antigos    │
                                        │ invalidados       │
                                        └───────────────────┘
```

---

## 4. Endpoints da API

### Auth

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login (CPF + senha) |
| POST | `/api/v1/auth/refresh` | Renovar tokens |
| POST | `/api/v1/auth/logout` | Invalidar sessão |
| POST | `/api/v1/auth/forgot-password` | Solicitar código SMS/WhatsApp |
| POST | `/api/v1/auth/verify-code` | Verificar código de recuperação |
| POST | `/api/v1/auth/reset-password` | Redefinir senha com código |
| POST | `/api/v1/auth/first-access` | Primeiro acesso (CPF → código → nova senha) |
| GET | `/api/v1/auth/me` | Dados do usuário logado |
| PUT | `/api/v1/auth/change-password` | Alterar senha (com verificação SMS) |

### Usuários (Admin)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/users` | Listar usuários (paginado) |
| POST | `/api/v1/users` | Criar usuário |
| GET | `/api/v1/users/:id` | Buscar usuário |
| PUT | `/api/v1/users/:id` | Atualizar usuário |
| DELETE | `/api/v1/users/:id` | Desativar usuário |
| PUT | `/api/v1/users/:id/permissions` | Atualizar permissões |

### Audit Logs

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/audit-logs` | Listar logs (filtros: user, entity, date) |
| GET | `/api/v1/audit-logs/:id` | Detalhes do log |

---

## 5. DTOs e Validações

### Login DTO
```typescript
class LoginDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // CPF formatado
  cpf: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Forgot Password DTO (Solicitar código)
```typescript
class ForgotPasswordDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{10,15}$/) // Formato internacional
  phone?: string; // Se não informado, usa o telefone cadastrado
}
```

### Verify Code DTO
```typescript
class VerifyCodeDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;

  @IsString()
  @Length(6, 6)
  @IsNumberString()
  code: string; // Código de 6 dígitos
}
```

### Reset Password DTO
```typescript
class ResetPasswordDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;

  @IsString()
  @Length(6, 6)
  @IsNumberString()
  code: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  newPassword: string;
}
```

### First Access DTO
```typescript
class FirstAccessDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;
}
```

### Create User DTO (Admin)
```typescript
class CreateUserDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;

  @IsOptional()
  @IsEmail()
  email?: string; // Opcional para colaboradores

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
```

---

## 6. Regras de Negócio

1. **Token JWT**: Access token expira em 15 minutos, refresh token em 7 dias
2. **Bloqueio**: Após 5 tentativas incorretas, conta bloqueada por 30 minutos
3. **Senha**: Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
4. **Soft delete**: Usuários nunca são deletados, apenas desativados
5. **Auditoria**: Todas as ações de create/update/delete são registradas
6. **Hierarquia**: Um supervisor só acessa dados dos seus postos
7. **Admin único**: Apenas 1 admin pode ser criado (configuração inicial)
8. **Código SMS/WhatsApp**: 6 dígitos numéricos, expira em 10 minutos
9. **Rate limit código**: Máximo 3 envios de código por hora por CPF
10. **Primeiro acesso**: Colaborador recém-cadastrado recebe SMS com instruções
11. **CPF como login**: Colaboradores usam CPF; gestores podem usar CPF ou e-mail
12. **Telefone obrigatório**: Colaborador deve ter telefone cadastrado para SMS/WhatsApp

---

## 7. Segurança

- Senhas hasheadas com **bcrypt** (12 rounds)
- Tokens assinados com **HS256** (ou RS256 para produção)
- Rate limiting: 100 requisições/min por IP
- Rate limit SMS: 3 envios/hora por CPF
- CORS restrito ao domínio do frontend
- Headers de segurança (Helmet.js)
- Logs de auditoria imutáveis
- Códigos SMS/WhatsApp armazenados com hash (não em texto plano)
- Telefone validado contra número cadastrado no banco

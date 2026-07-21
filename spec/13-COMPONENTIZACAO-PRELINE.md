# SPEC - Padronização de Componentização com Preline

## 1. Regra Fundamental

> **TODO o frontend deve ser componentizado usando componentes Preline.**
> Quando o Preline não fornecer um componente adequado, criar componente **custom reutilizável** seguindo os padrões do Preline.

---

## 2. Por que Preline?

| Benefício | Descrição |
|-----------|-----------|
| **Consistência visual** | Todos os componentes seguem o mesmo design system |
| **Velocidade** | Markup pronto, não precisa desenhar do zero |
| **Responsividade** | Componentes já responsivos |
| **Dark mode** | Suporte nativo via design tokens |
| **Acessibilidade** | Componentes seguem padrões ARIA |
| **Manutenção** | Atualizações do Preline melhoram todos os componentes |

---

## 3. Decisão: Preline ou Custom?

```
┌─────────────────────────────────────────────────────────────┐
│  FLUXO DE DECISÃO DE COMPONENTE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Preciso de um componente?                                  │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Preline tem?     │──── SIM ───▶ Usar Preline ✅          │
│  └────────┬────────┘                                        │
│           │ NÃO                                              │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Posso combinar  │──── SIM ───▶ Combinar Preline ✅      │
│  │ 2+ Preline?     │           (ex: Card + Table)          │
│  └────────┬────────┘                                        │
│           │ NÃO                                              │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Criar componente│──── SIM ───▶ Criar Custom 🔧          │
│  │ custom reutiliz.│           (seguindo padrões Preline)  │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Mapeamento de Componentes Preline por Tela

### 4.1 Auth / Login

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Container login | `HSBlock` ou `HSOverlay` | Centralizado na tela |
| Formulário login | `HSInput` + `HSButton` | CPF + senha |
| Input CPF | `HSInput` com mask | Máscara XXX.XXX.XXX-XX |
| Botão entrar | `HSButton` (primary) | `bg-primary` |
| Link "esqueci senha" | `HSHtmlLink` | Estilo ghost |
| Loading spinner | `HSSpinner` | Durante autenticação |
| Alert erro | `HSAlert` | Estilo danger |
| Toggle tema | `HSThemeSwitch` | Light/Dark mode |

### 4.2 Layout / Shell

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Sidebar navegação | `HSSidebar` | Colapsável |
| Navbar topo | `HSNavbar` | Com busca e perfil |
| Breadcrumb | `HSBreadcrumb` | Navegação hierárquica |
| Dropdown perfil | `HSDropdown` | Menu do usuário |
| Notificações | `HSBadge` + `HSDropdown` | Campainha + lista |
| Avatar usuário | `HSAvatar` | Foto ou iniciais |
| Menu mobile | `HSOverlay` + `HSMegaMenu` | Menu responsivo |

### 4.3 Dashboard / Cards

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Card KPI | `HSCard` | Ícone + valor + variação |
| Card gráfico | `HSCard` + Recharts | Container para gráficos |
| Badge status | `HSBadge` | Cores: success, warning, danger |
| Alertas | `HSAlert` | Notificações no topo |
| Progress bar | `HSProgress` | Indicadores de progresso |
| Stats block | `HSBlock` | Grid de estatísticas |

### 4.4 Tabelas / Listagens

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Tabela | `HSTable` | Listagens principais |
| Cabeçalho tabela | `HSTableHead` | Ordenação por coluna |
| Linha tabela | `HSTableRow` | Seleção, ações |
| Célula tabela | `HSTableCell` | Formatação de dados |
| Paginação | `HSPagination` | Navegação entre páginas |
| Busca/filtros | `HSInput` + `HSSelect` | Filtros acima da tabela |
| Empty state | `HSBlock` | "Nenhum registro encontrado" |
| Loading | `HSSpinner` | Carregamento de dados |
| Bulk actions | `HSButton` + `HSBadge` | Ações em massa |

### 4.5 Formulários

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Input texto | `HSInput` | Todos os campos de texto |
| Select/Combo | `HSSelect` | Seleção de opções |
| Multi-select | `HSMultiSelect` | Seleção múltipla |
| Checkbox | `HSCheckbox` | Opções binárias |
| Radio button | `HSRadio` | Seleção única |
| Toggle/Switch | `HSToggle` | Ativar/desativar |
| Date picker | `HSDatePicker` | Seleção de datas |
| Textarea | `HSTextarea` | Campos de texto longo |
| Input group | `HSInputGroup` | Ícone + input |
| File upload | `HSFileUpload` | Upload de documentos |
| Form layout | `HSFormLayout` | Grid de campos |
| Validação | `HSInvalid` + `HSValid` | Estados de erro/sucesso |
| Máscara | `HSInputMask` | CPF, telefone, CEP |

### 4.6 Botões / Ações

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Botão primário | `HSButton` (primary) | Ações principais |
| Botão secundário | `HSButton` (secondary) | Ações secundárias |
| Botão outline | `HSButton` (outline) | Ações neutras |
| Botão ghost | `HSButton` (ghost) | Ações de texto |
| Botão danger | `HSButton` (danger) | Excluir, desativar |
| Botão ícone | `HSButtonIcon` | Ações com ícone |
| Botão loading | `HSButton` + spinner | Durante processamento |
| Floating button | `HSFloatingButton` | Ação rápida (fab) |

### 4.7 Modais / Dialogs

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Modal confirmação | `HSModal` | Confirmar ações |
| Modal formulário | `HSModal` | Criar/editar registros |
| Modal visualização | `HSModal` | Detalhes read-only |
| Drawer lateral | `HSDrawer` | Formulários complexos |
| Overlay | `HSOverlay` | Fundo escurecido |

### 4.8 Navegação / Abas

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Tabs | `HSTabs` | Alternar entre views |
| Pills tabs | `HSTabs` (pills) | Navegação por abas |
| Stepper | `HSStepper` | Formulários multi-step |
| Breadcrumb | `HSBreadcrumb` | Caminho de navegação |

### 4.9 Calendário / Timeline

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Calendário | Custom (Recharts/custom) | Escalas de trabalho |
| Timeline | Custom | Histórico do colaborador |
| Gantt | Custom | Alocação de postos |

### 4.10 Gráficos / BI

| Elemento | Componente Preline | Observação |
|----------|-------------------|------------|
| Container gráfico | `HSCard` | Wrapper para gráficos |
| Legenda | `HSBadge` | Indicadores de cor |
| Tooltip | `HSTooltip` | Info ao passar mouse |
| Filtros período | `HSDatePicker` + `HSSelect` | Filtros de data |

---

## 5. Paleta de Cores Spark + Preline

### 5.1 Tokens Preline (usar sempre)

```css
/* Fundo e superfícies */
bg-background          /* Fundo da página */
bg-background-1        /* Fundo alternativo (gray-50) */
bg-card                /* Cards e containers */
bg-layer               /* Seções internas */
bg-surface             /* Cabeçalho de tabelas */
bg-navbar              /* Barra de navegação */

/* Bordas */
border-card-line       /* Bordas de cards */
border-layer-line      /* Bordas internas */
border-navbar-line     /* Bordas da navbar */

/* Texto */
text-foreground        /* Texto principal */
text-muted-foreground-1 /* Texto secundário */
text-muted-foreground-2 /* Texto terciário */

/* Botões */
bg-primary             /* Botão principal (Spark vermelho) */
bg-primary-hover       /* Hover do botão principal */
bg-secondary           /* Botão secundário */
bg-danger              /* Ações destrutivas */
bg-success             /* Confirmações positivas */
bg-warning             /* Alertas */
```

### 5.2 Cores Spark (estilo Preline)

```css
:root {
  /* Spark brand - usar como cores explícitas quando necessário */
  --spark-primary: #1a1a2e;
  --spark-secondary: #16213e;
  --spark-accent: #e94560;
  --spark-gold: #f5a623;
}

/* Usar como classes Tailwind */
.bg-spark-primary      /* Azul escuro Spark */
.bg-spark-accent       /* Vermelho acento Spark */
.bg-spark-gold         /* Dourado Spark */
```

### 5.3 Regras de Dark Mode

```tsx
// ✅ CORRETO - Usar tokens Preline (alternam automaticamente)
<div className="bg-card border border-card-line">
  <span className="text-foreground">Texto</span>
</div>

// ✅ CORRETO - Usar dark: apenas para cores explícitas
<span className="bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400">
  Badge
</span>

// ❌ ERRADO - Usar dark: em tokens do Preline
<div className="bg-card dark:bg-gray-800">  {/* JÁ MUDA AUTOMATICAMENTE */}
```

---

## 6. Componentes Custom (quando Preline não atende)

### 6.1 Regras para Criar Componentes Custom

1. **Seguir naming do Preline**: Prefixo `HS` ou sem prefixo
2. **Usar design tokens**: Nunca hardcodar cores
3. **Suportar dark mode**: Via tokens Preline
4. **Ser reutilizável**: Props flexíveis, não específico de uma tela
5. **Documentar**: Comentário JSDoc com exemplo de uso
6. **Responsivo**: Testar em mobile, tablet e desktop

### 6.2 Exemplo de Componente Custom

```tsx
// components/StatusBadge.tsx
import { HSBadge } from "preline"

interface StatusBadgeProps {
  status: "ATIVO" | "INATIVO" | "PENDENTE" | "ERRO"
  label?: string
}

const statusConfig = {
  ATIVO: { color: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400", icon: "✓" },
  INATIVO: { color: "bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-400", icon: "—" },
  PENDENTE: { color: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400", icon: "⏳" },
  ERRO: { color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400", icon: "✗" },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      {label || status}
    </span>
  )
}
```

### 6.3 Lista de Componentes Custom Esperados

| Componente | Descrição | Usado em |
|------------|-----------|----------|
| `StatusBadge` | Badge de status colorido | Listagens |
| `FormField` | Wrapper de campo com label + erro | Formulários |
| `DataTable` | Tabela com busca, paginação, ordenação | Todas as listagens |
| `PageHeader` | Cabeçalho de página com título + ações | Todas as telas |
| `EmptyState` | Estado vazio com ícone e mensagem | Listagens |
| `LoadingOverlay` | Overlay de carregamento | Formulários |
| `ConfirmDialog` | Modal de confirmação | Exclusões |
| `DateRangePicker` | Seletor de período | Relatórios, BI |
| `FileUpload` | Upload com preview | Documentos |
| `Timeline` | Linha do tempo | Histórico |
| `CalendarGrid` | Grid de calendário | Escalas |
| `KPICard` | Card de métricas | Dashboard |
| `ChartCard` | Container para gráficos | BI |
| `NotificationBell` | Campainha com badge | Navbar |
| `AvatarUpload` | Upload de foto com preview | Colaboradores |
| `MaskedInput` | Input com máscara (CPF, tel) | Formulários |

---

## 7. Estrutura de Pastas Frontend

```
src/
├── components/
│   ├── ui/                    # Componentes Preline (markup)
│   │   ├── button.tsx         # Wrapper do HSButton
│   │   ├── card.tsx           # Wrapper do HSCard
│   │   ├── input.tsx          # Wrapper do HSInput
│   │   ├── select.tsx         # Wrapper do HSSelect
│   │   ├── modal.tsx          # Wrapper do HSModal
│   │   ├── table.tsx          # Wrapper do HSTable
│   │   ├── badge.tsx          # Wrapper do HSBadge
│   │   ├── alert.tsx          # Wrapper do HSAlert
│   │   ├── tabs.tsx           # Wrapper do HSTabs
│   │   ├── pagination.tsx     # Wrapper do HSPagination
│   │   ├── dropdown.tsx       # Wrapper do HSDropdown
│   │   ├── sidebar.tsx        # Wrapper do HSSidebar
│   │   ├── navbar.tsx         # Wrapper do HSNavbar
│   │   ├── avatar.tsx         # Wrapper do HSAvatar
│   │   ├── toggle.tsx         # Wrapper do HSToggle
│   │   ├── spinner.tsx        # Wrapper do HSSpinner
│   │   └── index.ts           # Export barrel
│   │
│   ├── custom/                # Componentes custom reutilizáveis
│   │   ├── StatusBadge.tsx
│   │   ├── FormField.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── KPICard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── Timeline.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── MaskedInput.tsx
│   │   ├── FileUpload.tsx
│   │   └── index.ts           # Export barrel
│   │
│   └── layout/                # Layout da aplicação
│       ├── AppLayout.tsx       # Shell principal (sidebar + navbar)
│       ├── AuthLayout.tsx      # Layout de login
│       ├── Sidebar.tsx         # Menu lateral
│       ├── Navbar.tsx          # Barra superior
│       ├── Breadcrumb.tsx      # Navegação hierárquica
│       └── ThemeToggle.tsx     # Toggle light/dark
│
├── pages/                     # Páginas (usam componentes ui + custom)
│   ├── auth/
│   ├── dashboard/
│   ├── employees/
│   ├── contracts/
│   ├── scales/
│   ├── payroll/
│   ├── training/
│   ├── aso/
│   ├── uniforms/
│   ├── vehicles/
│   ├── occurrences/
│   ├── vacations/
│   ├── benefits/
│   ├── reports/
│   └── settings/
│
├── hooks/                     # Hooks customizados
│   ├── usePreline.ts          # Re-inicialização Preline
│   ├── useAuth.ts
│   ├── usePagination.ts
│   └── ...
│
├── lib/                       # Utilitários
│   ├── api.ts                 # Axios instance
│   ├── formatters.ts          # Formatação de dados
│   ├── validators.ts          # Zod schemas
│   └── constants.ts           # Constantes
│
└── styles/
    └── index.css              # Tailwind + Preline config
```

---

## 8. Checklist de Componentização

Antes de criar qualquer componente, verificar:

- [ ] Preline tem este componente? → Usar Preline
- [ ] Posso combinar 2+ componentes Preline? → Combinar
- [ ] Não existe no Preline? → Criar custom seguindo padrões
- [ ] O componente custom usa design tokens Preline? → Sim
- [ ] Suporta dark mode? → Via tokens
- [ ] É reutilizável em outras telas? → Sim
- [ ] Está responsivo? → Mobile first
- [ ] Tem documentação (JSDoc)? → Sim

---

## 9. Erros Comuns a Evitar

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| `<div className="bg-white shadow rounded">` | `<div className="bg-card border border-card-line shadow-2xs rounded-xl">` |
| `<button className="bg-blue-500 text-white">` | `<button className="bg-primary border border-primary-line text-primary-foreground">` |
| `<input className="border rounded px-3">` | Usar `HSInput` do Preline |
| `<span className="text-gray-500">` | `<span className="text-muted-foreground-1">` |
| `<div className="bg-gray-50">` | `<div className="bg-background-1">` |
| Criar `Button.tsx` do zero | Usar `HSButton` como base |
| `dark:bg-gray-800` em `bg-card` | `bg-card` já muda no dark mode |

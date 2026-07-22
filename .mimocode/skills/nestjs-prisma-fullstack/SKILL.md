---
name: nestjs-prisma-fullstack
description: "Standardized workflow for building full-stack apps with NestJS, Prisma (v5/v6), React (Vite), and Preline UI. Includes build, migration, and seed commands."
---

# Full-Stack: NestJS + Prisma + React (Preline)

## 1. Core Stack & Constraints
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React (Vite) + TailwindCSS v4 + Preline UI + Zustand
- **Prisma Version**: Use v5.22.0 or v6.x. **NEVER use v7.x** (ESM-only output is incompatible with NestJS CJS compilation).
- **UI Framework**: Preline UI with dark mode support (semantic tokens + theme.css).

## 2. Setup & Commands
Always run these from the project root or the specific workspace.

### Backend (NestJS)
```bash
# Install dependencies
npm install @prisma/client @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer

# Generate Prisma Client
npx prisma generate

# Run Migrations (Interactive)
npx prisma migrate dev --name <migration_name>

# Seed Database
npx prisma db seed

# Build API
npx nest build

# Start Dev Server
npm run start:dev
```

### Frontend (React/Vite)
```bash
# Install dependencies
npm install preline react-router-dom @tanstack/react-query zustand lucide-react

# Build Web
npm run build

# Start Dev Server (proxies to :3000)
npm run dev
```

## 3. Common Patterns & Fixes

### Prisma ESM/CJS Fix
If you see `exports is not defined in ES module scope`:
1. Downgrade to Prisma 5.x or 6.x.
2. Ensure `prisma.config.ts` uses `seed: "npx tsx prisma/seed.ts"`.
3. Use `import { PrismaClient } from '@prisma/client'` directly.

### Preline Dark Mode
1. Import in `index.css`:
   ```css
   @import "../node_modules/preline/css/variants.css";
   @import "../node_modules/preline/css/themes/theme.css";
   @custom-variant dark (&:is(.dark *));
   ```
2. Add flash-prevention script in `index.html` `<head>`:
   ```html
   <script>
     if (localStorage.getItem('hs_theme') === 'dark') document.documentElement.classList.add('dark');
   </script>
   ```
3. Use semantic tokens: `bg-background`, `bg-card`, `text-foreground`, `bg-primary`.

### CRUD Modal Pattern
For every entity (Contacts, Cases, etc.):
1. Create `useCreate`, `useUpdate`, `useDelete` hooks (or inline `useMutation`).
2. Use `HSModal` or custom `Modal` component for Create/Edit forms.
3. Table list with `Pencil` (Edit) and `Trash2` (Delete) icons.

## 4. Verification
After implementation, always run:
```bash
npm run build --workspace=backend && npm run build --workspace=frontend
```

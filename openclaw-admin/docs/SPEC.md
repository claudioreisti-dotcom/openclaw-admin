# Especificação funcional

> **⏸ Aguardando schema.** As seções marcadas com 🔶 serão completadas quando o schema real do banco for fornecido. O restante é final.

## 1. Autenticação

### Login (`/login`)
- Formulário com email + senha
- Erro inline se credenciais inválidas
- Redireciona para `/dashboard` em caso de sucesso
- Link "Esqueci minha senha" → fluxo de reset por email (fase 2)
- Opcional: botão "Entrar com Telegram" (widget oficial)

### Middleware de proteção
- Rotas `/dashboard`, `/tasks`, `/settings` exigem sessão
- Sem sessão → redireciona para `/login?redirectTo=/caminho-original`

### Logout
- Botão no header do app → POST para `/api/auth/signout` → volta pra `/login`

## 2. Dashboard (`/dashboard`)

Layout de 12 colunas responsivo; stack vertical em mobile.

**KPIs (cards no topo):**
- Total de demandas ativas
- Concluídas nos últimos 7 dias
- Atrasadas (se houver campo de prazo)
- Tempo médio de conclusão 🔶

**Gráficos:**
- Linha: demandas criadas vs concluídas por dia (últimos 30 dias)
- Pizza/donut: distribuição por status
- Barras: distribuição por prioridade 🔶

**Lista:**
- Últimas 10 demandas recentes com link pro detalhe

Dados via query única em `lib/db/queries/metrics.ts`; cache de 60s.

## 3. Lista de demandas (`/tasks`)

> Nome da rota será ajustado ao nome real da entidade principal no banco.

### Layout

Desktop: tabela com colunas:
- Checkbox (bulk)
- Título / descrição (truncada)
- Status (badge)
- Prioridade (badge)
- Criado em
- Ações (⋯)

Mobile: cards empilhados com os mesmos campos, checkbox à esquerda.

### Filtros (sidebar drawer em mobile, painel fixo em desktop)
- Busca por texto (full-text em título + descrição)
- Status (multi-select)
- Prioridade (multi-select)
- Intervalo de datas
- Tags / categorias 🔶
- Botão "Limpar filtros"

Filtros persistem na URL como query params (shareable/linkable).

### Ordenação
- Coluna clicável no header (desktop); dropdown em mobile
- Default: mais recente primeiro

### Paginação
- Server-side, 50 itens por página
- URL param `?page=N`

### Bulk actions
Barra aparece quando ≥1 item selecionado:
- Marcar como concluída
- Arquivar
- Mudar prioridade (dropdown)
- Excluir (com confirmação modal)

Ações batch confirmadas via Server Action, invalidando cache TanStack Query.

## 4. Criar demanda (`/tasks/new`)

Formulário com os campos principais da entidade 🔶. Validação Zod. Submit:
- Sucesso → redireciona pra `/tasks/[id]` com toast "Criada"
- Erro → mostra erros inline

## 5. Detalhe / editar demanda (`/tasks/[id]`)

- Todos os campos editáveis inline (ou em modo "editar")
- Histórico de alterações (se houver tabela de log) 🔶
- Histórico de conversas do agent sobre essa demanda (se mapeável) 🔶
- Botão "Concluir" / "Arquivar" / "Excluir"
- Breadcrumb: Tasks > [Título truncado]

## 6. Settings (`/settings`)

- Perfil: nome, email, senha
- Preferências: tema (auto/claro/escuro), idioma (pt-BR / en)
- Vinculação com Telegram (mostra `telegram_user_id` vinculado)
- Export de dados: botão "Baixar meus dados" → CSV/JSON

## 7. PWA

- Manifest com nome, ícones, theme-color, background-color
- Instalável em iOS/Android/desktop
- Service Worker (Serwist):
  - Precache: shell da app (HTML/CSS/JS)
  - Runtime cache: imagens (CacheFirst), API (NetworkFirst com fallback offline em leitura)
- Offline: tela simples `app/offline/page.tsx` quando sem rede e sem cache

## 8. Acessibilidade

- Todos os controles interativos com foco visível
- `aria-label` em botões de ícone
- Contraste AA mínimo em ambos os temas
- Navegação por teclado em tabelas e dropdowns
- `prefers-reduced-motion` respeitado

## 9. Internacionalização

- pt-BR como default, en como fallback
- Usar `next-intl` (simples, App Router-native)
- Arquivos em `messages/pt-BR.json` e `messages/en.json`

> **Nota:** A implementação de i18n é **fase 2**. O TASKS.md não inclui tarefas de i18n no escopo inicial; adicionar quando o produto base estiver funcional.

## 10. Erros e estados vazios

- `app/error.tsx` — erro em runtime, botão "Tentar de novo"
- `app/not-found.tsx` — 404 amigável
- Listas vazias: ilustração + CTA "Criar primeira demanda"
- Skeletons em loaders (shadcn Skeleton)

---

## Entidades esperadas 🔶

*A preencher com base no schema.txt. Template:*

### `<tabela_principal>`
- Campos relevantes para CRUD: ...
- Campos read-only: ...
- Relacionamentos: ...
- Enums: ...

### `<tabela_usuarios>`
- ...

### `<tabela_conversas>` (se existir)
- ...

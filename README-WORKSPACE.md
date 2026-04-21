# Alfred — Workspace

Este diretório é o workspace do projeto Alfred (painel admin para o agent OpenClaw).

## Estrutura

- `openclaw-admin/` — **código da aplicação web** (Next.js 15) — trabalhar aqui
  - `docs/` — documentação canónica do projeto
  - `scripts/` — utilitários (inspect_db.py, etc.)
- `definições de designs/` → ver `design-assets/` (renomeado)
- `.aiox-core/`, `.claude/` — infra AIOX (não modificar)

## Docs do projeto

Todos os documentos de referência ficam em `openclaw-admin/docs/`:
- `PROJECT.md` — visão geral e stack
- `SPEC.md` — especificação funcional
- `TASKS.md` — roteiro de tarefas
- `ARCHITECTURE.md` — decisões técnicas

Os ficheiros `PROJECT.md`, `SPEC.md`, `TASKS.md`, `ARCHITECTURE.md` na raiz deste workspace são **cópias de referência** — a versão canónica está em `openclaw-admin/docs/`.

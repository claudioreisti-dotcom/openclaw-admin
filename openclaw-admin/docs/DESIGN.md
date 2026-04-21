# Design — Alfred Admin

## Mockups e Protótipos

Os ficheiros de design estão em `/design-assets/` na raiz do workspace.

| Ficheiro | Descrição |
|---|---|
| `Alfred Admin.html` | Mockup completo do painel admin (abrir no browser) |
| `Alfred Handoff.html` | Especificações de handoff (medidas, espaçamentos, cores) |
| `components/dashboard-v1.jsx` | Dashboard — variante v1 |
| `components/dashboard-v2.jsx` | Dashboard — variante v2 (recomendada) |
| `components/dashboard-v3.jsx` | Dashboard — variante v3 (dark-first) |
| `components/tasks.jsx` | Lista de demandas |
| `components/shell.jsx` | Shell da aplicação (sidebar + header) |
| `components/screens.jsx` | Todas as telas |
| `components/icons.jsx` | Ícones customizados |
| `components/mock-data.jsx` | Dados mock para prototipagem |
| `styles/tokens.css` | Design tokens (cores, tipografia, espaçamento) |

## Como usar os mockups

1. Abre `Alfred Admin.html` no browser para ver o design completo
2. Consulta `Alfred Handoff.html` para medidas e especificações de implementação
3. Referencia `styles/tokens.css` para as variáveis CSS ao implementar

## Design Tokens

Ver `design-assets/styles/tokens.css` para:
- Paleta de cores (light + dark mode)
- Tipografia
- Espaçamento e grid
- Border radius e shadows

## Relação com o SPEC.md

Os mockups implementam as telas definidas no `SPEC.md`. Em caso de conflito entre mockup e spec, o mockup prevalece para questões visuais; o SPEC prevalece para lógica de negócio.

# Path-Specific Rules

Rules in `.claude/rules/` are automatically enforced when editing files in matching paths:

| Rule File | Path Pattern | Enforces |
| Rule File | Path Pattern | Enforces |
| ---- | ---- | ---- |
| `api-code.md` | `src/api/**` | REST/GraphQL conventions, authentication, error format |
| `frontend-code.md` | `src/frontend/**` | Accessibility (WCAG), design tokens, i18n, state management |
| `db-code.md` | `src/**db**` | Migrations, parameterized queries, indexing |
| `ui-code.md` | `src/ui/**` | No business logic in UI, localization-ready, keyboard accessible |
| `ai-code.md` | `src/ai/**` | Performance budgets, model params must be configurable, explainability |
| `network-code.md` | `src/networking/**` | WebSocket standards, real-time event streaming |
| `config-code.md` | `config/**` | Schema validation, no hardcoded secrets, versioning |
| `design-docs.md` | `design/docs/**` | Required PRD sections, clear acceptance criteria |
| `test-standards.md` | `tests/**` | Test naming conventions, coverage requirements, no flaky patterns |
| `prototype-code.md` | `prototypes/**` | Relaxed standards, README required, hypothesis documented |

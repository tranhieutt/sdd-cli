# create-sdd

> Scaffold a **Claude Code Software Development Department** into any project — in one command.

SDD is a production-grade Claude Code configuration framework: 27 specialist agents, 115 slash-command skills, 13 coding rules, 11 lifecycle hooks, and a tiered memory system — all wired together and ready to use.

---

## Quick Start

```bash
# New project
npx create-sdd my-project

# Existing project
cd my-project
npx create-sdd .
```

That's it. Open the project in Claude Code and run `/start`.

---

## Commands

### `npx create-sdd [dir]`

Scaffold SDD into a new or existing directory with an interactive setup wizard.

```bash
npx create-sdd my-app                        # interactive
npx create-sdd my-app --stack ts-nextjs      # preset stack, skip prompts
npx create-sdd my-app --minimal              # CLAUDE.md + rules + hooks only
npx create-sdd my-app --stack py-fastapi -y  # fully non-interactive
```

### `sdd init`

Add SDD to an existing project in the current directory. Detects existing installations and offers merge vs overwrite.

```bash
sdd init
sdd init --stack go-gin
sdd init --minimal --yes
```

### `sdd add <module>`

Add or update a single SDD module.

```bash
sdd add skills      # 115 slash-command skills
sdd add agents      # 27 specialist agents
sdd add rules       # 13 coding rules
sdd add hooks       # 11 lifecycle hooks
sdd add memory      # tiered memory system
sdd add docs        # internal documentation
```

### `sdd upgrade`

Upgrade installed templates to the latest version. Detects user-modified files and preserves them.

```bash
sdd upgrade                  # upgrade all modules
sdd upgrade --dry-run        # preview changes, no writes
sdd upgrade --module skills  # upgrade one module only
sdd upgrade --yes            # non-interactive
```

---

## Preset Stacks

| Key | Language | Framework | Database |
|-----|----------|-----------|----------|
| `ts-nextjs` | TypeScript | Next.js | PostgreSQL |
| `ts-react` | TypeScript | React + Vite | — |
| `py-fastapi` | Python | FastAPI | PostgreSQL |
| `py-django` | Python | Django | PostgreSQL |
| `go-gin` | Go | Gin | PostgreSQL |
| `js-express` | JavaScript | Express | MongoDB |

---

## What Gets Installed

```
your-project/
├── CLAUDE.md                    # Master config (stack pre-filled from preset)
└── .claude/
    ├── agents/                  # 27 specialist agents
    │   ├── backend-developer.md
    │   ├── frontend-developer.md
    │   ├── qa-lead.md
    │   └── ... (24 more)
    ├── skills/                  # 115 slash-command skills
    │   ├── planning-and-task-breakdown/
    │   ├── spec-driven-development/
    │   ├── test-driven-development/
    │   └── ... (112 more)
    ├── rules/                   # 13 domain coding rules
    │   ├── api-code.md
    │   ├── database-code.md
    │   ├── frontend-code.md
    │   └── ... (10 more)
    ├── hooks/                   # 11 lifecycle hooks
    │   ├── session-start.sh
    │   ├── bash-guard.sh
    │   ├── validate-commit.sh
    │   └── ... (8 more)
    ├── memory/                  # Tiered memory system
    │   └── MEMORY.md
    ├── docs/                    # Internal documentation
    └── sdd-version.json         # Version tracking
```

---

## Conflict Handling

| Situation | Default behavior |
|-----------|-----------------|
| `sdd init` on existing project | Prompt: merge or overwrite |
| `sdd init --yes` | Auto-merge (safe) |
| `CLAUDE.md` already exists | Preserved (never overwritten) |
| `MEMORY.md` already exists | Preserved (never overwritten) |
| `sdd upgrade` | Skip user-modified files (checksum detection) |

---

## Requirements

- Node.js 18+
- Claude Code CLI

---

## After Installation

Open your project in Claude Code and run:

```
/start    # guided onboarding — configure your stack and first sprint
/plan     # break down a feature into atomic tasks
/spec     # write a technical spec before coding
/tdd      # test-driven development workflow
```

---

## License

MIT © [tranhieutt](https://github.com/tranhieutt)

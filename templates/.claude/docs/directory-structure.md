# Directory Structure

```text
/
├── CLAUDE.md                    # Master configuration
├── PRD.md                       # Product requirements (source of truth — human-editable only)
├── TODO.md                      # Living backlog (governed by @producer)
├── .claude/                     # Agent definitions, skills, hooks, rules, docs
│   ├── memory/                  # Durable memory
│   │   ├── specialists/         # Isolated context for specialized agents
│   │   └── MEMORY.md            # Consolidated project memory
├── .tasks/                      # Task detail files (NNN-short-title.md — one per TODO item)
│   └── checkpoints/             # Atomic cognitive states for /resume-from (gitignored)
├── src/                         # Application source code (api, frontend, backend, ai, networking, ui, tools)
├── design/                      # Design files (wireframes, research, design specs)
├── docs/                        # Technical documentation
│   ├── technical/               # Architecture, decisions, API, database specs
│   │   ├── ARCHITECTURE.md      # System architecture (C4 model) — owned by @technical-director
│   │   ├── DECISIONS.md         # ADR log (append-only) — owned by @technical-director / @cto
│   │   ├── API.md               # API reference — owned by @backend-developer
│   │   └── DATABASE.md          # Schema documentation — owned by @data-engineer
│   └── user/                    # User-facing documentation
│       └── USER_GUIDE.md        # End-user guide — owned by @tech-writer
├── tests/                       # Test suites (unit, integration, e2e, performance)
├── infra/                       # Infrastructure as code (docker, terraform, k8s)
├── scripts/                     # Build, migration, and utility scripts
├── prototypes/                  # Throwaway prototypes (isolated from src/)
└── production/                  # Production management (sprints, milestones, releases)
    ├── session-state/           # Ephemeral session state (active.md, circuit-state.json - gitignored)
    ├── session-logs/            # Session audit trail (gitignored)
    └── traces/                  # MAS observability ledger
        ├── decision_ledger.jsonl # reasoning logs
        └── agent-metrics.jsonl  # performance registry
```

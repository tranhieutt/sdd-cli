---
name: save-state
description: "Saves current working context to production/session-state/active.md and creates an atomic checkpoint in .tasks/checkpoints/ to survive context compaction, /clear, or session restart. Essential for MAS fault tolerance (Upgrade #1)."
argument-hint: "[optional task_id] [optional note]"
user-invocable: true
allowed-tools: Read, Write, Glob, Bash
effort: 3
when_to_use: "Use before any major context reset, when context usage exceeds 60%, or when ending a session to preserve working context across compaction or restart. Mandatory before handoffs."
---

# Save State Skill

Dump the current working context into `production/session-state/active.md` and a unique checkpoint in `.tasks/checkpoints/`.

This mechanism ensures MAS fault tolerance by allowing immediate resumption from specific task states.

## Steps

### 1. Gather context

Before writing anything, collect the following from the current conversation and working state:

- **Task ID**: Extract from conversation or use `$ARGUMENTS` (e.g., NNN).
- **Current task**: What is the primary task being worked on right now?
- **Progress**: What has been completed in this session? List key milestones.
- **Decisions made**: What architectural, design, or implementation decisions were made?
- **Files modified**: Run `git diff --name-only && git diff --staged --name-only` to get the current working tree state.
- **Open questions**: What is unresolved or blocked?
- **Next step**: What is the very next action to take when resuming?

### 2. Extract Durable Memory

Are there any lessons learned, coding patterns established, or technical decisions made in this session that apply globally to the project?
If so, before writing checkpoints:
- Write or update a topic file in `.claude/memory/specialists/` or `.claude/memory/`.
- Update `.claude/memory/MEMORY.md` if necessary.

### 3. Write State files

1. Overwrite `production/session-state/active.md` with the structure below.
2. Create a new unique file in `.tasks/checkpoints/` named `[task_id]-[agent_id]-[timestamp].md` with the same content.

```markdown
# Session State / MAS Checkpoint

> Saved: [ISO timestamp]
> Branch: [current git branch]
> Task ID: [task_id]
> Agent ID: [your agent role name]

## Current Task

[One sentence describing what is being worked on]

<!-- STATUS -->
Epic: [epic name or leave blank]
Feature: [feature name or leave blank]
Task: [specific task or leave blank]
<!-- /STATUS -->

## Progress (This Session)

[Bulleted list of what was completed]

## Key Decisions Made

[Bulleted list — include the decision AND the rationale. These survive context loss.]

## Files Being Actively Worked On

[List of files currently modified or in progress]

## Open Questions / Blockers

[List of unresolved items. Mark with [BLOCKED] if waiting on someone.]

## Next Step

[The single most important next action to take when resuming]

## Notes

[$ARGUMENTS if provided, otherwise omit this section]
```

### 4. Confirm

Print:

```text
Session state saved to production/session-state/active.md
Atomic checkpoint created in .tasks/checkpoints/[filename].md
[If memory was extracted]: Durable memories extracted to .claude/memory/MEMORY.md
Resume with: /resume-from [Task_ID] or read active.md.
```

---

## When to run `/save-state`

- Before `/clear` or starting a new unrelated task
- When context usage feels high (>60%)
- After completing a major milestone (phase, feature, design section)
- Before ending a work session
- **Mandatory** before any Agent-to-Agent handoff.

---
name: resume-from
description: "Restores cognitive state from an atomic checkpoint in .tasks/checkpoints/. Essential for MAS fault tolerance (Upgrade #1)."
argument-hint: "[optional task_id or specific_filename]"
user-invocable: true
allowed-tools: Read, Glob, Bash
effort: 2
when_to_use: "Use at the start of a session, after a crash, or when switching back to a previous task to recover full context."
---

# Resume From Skill

Load a cognitive snapshot from `.tasks/checkpoints/` to restore task context immediately.

## Steps

### 1. Locate Checkpoint

- If `$ARGUMENTS` is a `task_id` (e.g., NNN), use `ls .tasks/checkpoints/NNN-*` to find related snapshots.
- If `$ARGUMENTS` is empty, find the most recent file in `.tasks/checkpoints/` using `ls -t .tasks/checkpoints/ | head -n 1`.
- If no checkpoint is found, fallback to reading `production/session-state/active.md`.

### 2. Restore Context

- Read the identified checkpoint file.
- **INTERNALIZE** the following:
    - **Current Task**: What needs to be done.
    - **Progress**: What was already done (do not repeat).
    - **Decisions**: Respect established architectural and design choices.
    - **Next Step**: Execute the recorded next action.

### 3. Verify Working Tree

- Run `git status` to ensure the files in the "Files Being Actively Worked On" list are still in the expected state.

### 4. Confirm

Print:

```text
Cognitive state restored from [filename].
Task ID: [extracted task_id]
Next Action: [extracted next_step]
```

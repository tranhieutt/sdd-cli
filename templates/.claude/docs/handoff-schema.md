# Agent-to-Agent (A2A) Handoff Schema

Standardized contract for transferring tasks between specialists to ensure zero context loss.

## Schema Definition (JSON)

Every handoff must be documented in the task's checkpoint or session log using this structure:

```jsonc
{
  "handoff_id": "HO-NNN-TIMESTAMP",
  "from": "agent-role-name",
  "to": "agent-role-name",
  "artifact": "path/to/primary/output",
  "status": "Success | Partial | Iteration-Required",
  "acceptance_criteria": [
    "Requirement 1",
    "Requirement 2"
  ],
  "context_snapshot": "path/to/checkpoint/file.md",
  "risk_tier": "Low | Medium | High",
  "notes": "Cognitive state transfer notes"
}
```

## Protocol Rules

1. **Explicit Acceptance**: The receiving agent MUST read the `context_snapshot` before executing tools.
2. **Contract Generation**: Use the `/handoff` skill to generate this JSON block automatically.
3. **Traceability**: All handoffs must be registered in `production/traces/decision_ledger.jsonl`.

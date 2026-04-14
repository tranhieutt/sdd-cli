#!/bin/bash
# Claude Code SubagentStart hook: Structured JSONL audit log
# Logs agent invocations with session_id, timestamp, branch for queryability.
#
# Input schema (SubagentStart):
# { "session_id": "...", "agent_id": "...", "agent_name": "..." }

INPUT=$(cat)

# Parse fields
if command -v jq >/dev/null 2>&1; then
    AGENT_NAME=$(echo "$INPUT" | jq -r '.agent_name // "unknown"' 2>/dev/null)
    AGENT_ID=$(echo "$INPUT"   | jq -r '.agent_id   // "unknown"' 2>/dev/null)
    SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null)
else
    AGENT_NAME=$(echo "$INPUT" | grep -oE '"agent_name"[[:space:]]*:[[:space:]]*"[^"]*"' | \
        sed 's/"agent_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
    AGENT_ID=$(echo "$INPUT" | grep -oE '"agent_id"[[:space:]]*:[[:space:]]*"[^"]*"' | \
        sed 's/"agent_id"[[:space:]]*:[[:space:]]*"//;s/"$//')
    SESSION_ID=$(echo "$INPUT" | grep -oE '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | \
        sed 's/"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//')
    [ -z "$AGENT_NAME"  ] && AGENT_NAME="unknown"
    [ -z "$AGENT_ID"    ] && AGENT_ID="unknown"
    [ -z "$SESSION_ID"  ] && SESSION_ID="unknown"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
LOG_DIR="production/session-logs"

mkdir -p "$LOG_DIR" 2>/dev/null

# ─── JSONL entry ──────────────────────────────────────────────────────────────
LOG_ENTRY="{\"event\":\"SubagentStart\",\"timestamp\":\"$TIMESTAMP\",\"session_id\":\"$SESSION_ID\",\"agent_id\":\"$AGENT_ID\",\"agent_name\":\"$AGENT_NAME\",\"branch\":\"$BRANCH\"}"

echo "$LOG_ENTRY" >> "$LOG_DIR/agent-audit.jsonl" 2>/dev/null

# ─── Also keep human-readable text log ───────────────────────────────────────
echo "$TIMESTAMP | $AGENT_NAME ($AGENT_ID) | branch: $BRANCH | session: $SESSION_ID" \
    >> "$LOG_DIR/agent-audit.log" 2>/dev/null

exit 0

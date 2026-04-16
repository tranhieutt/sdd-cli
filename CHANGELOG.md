# Changelog

All notable changes to the **SDD CLI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.31.0] - 2026-04-16

### Added

- **Implementation of Upgrade #1: Atomic Checkpointing**:
  - Functional `save-state` skill that persists cognitive snapshots to `.tasks/checkpoints/`.
  - New `resume-from` skill to restore context from specific checkpoints or the latest state.
- **MAS Infrastructure Foundation**:
  - Integrated A2A Handoff Schema and Circuit Breaker rules into coordination templates.

## [1.30.0] - 2026-04-16

### Initial MAS Upgrade
- **Multi-Agent Systems (MAS) Infrastructure Upgrade**:
  - New directory structure for MAS observability and fault tolerance.
  - `templates/.claude/docs/handoff-schema.md`: Standardized A2A communication contract.
  - `/save-state` & `/resume-from` commands for Atomic Checkpointing.
  - `/handoff` command for context-safe specialist rotation.
  - `/trace-history` & `/agent-health` commands for Decision Tracing and Performance Metrics.
- **Circuit Breaker Pattern**: Integrated into `coordination-rules.md` to prevent token waste on failing agents.

### Changed

- `templates/CLAUDE.md.template`: Enhanced with MAS workflow commands and communication references.
- `templates/.claude/docs/directory-structure.md`: Added production traces and specialist memory isolation folders.
- `templates/.claude/docs/coordination-rules.md`: Updated with fault isolation and checkpointing protocols.

## [0.1.0] - 2025-06-01

### Added

- Initial release of `create-sdd` CLI.
- Basic scaffolding for Claude Code "Software Development Department".
- Core directory structure and base template files.

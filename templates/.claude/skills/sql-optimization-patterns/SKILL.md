---
name: sql-optimization-patterns
type: reference
description: "Provides SQL query optimization techniques, indexing strategies, and EXPLAIN analysis for improving database performance and eliminating slow queries. Use when debugging slow SQL queries or when the user mentions SQL optimization, slow queries, or database performance."
paths: ["**/*.sql", "**/migrations/**", "**/schema.*", "**/*.prisma"]
when_to_use: "When debugging slow SQL queries, designing indexing strategies, or analyzing EXPLAIN plans for performance optimization"
allowed-tools: Read, Glob, Grep
user-invocable: true
effort: 3
---

# SQL Optimization Patterns

Transform slow database queries into lightning-fast operations through systematic optimization, proper indexing, and query plan analysis.

## Use this skill when

- Debugging slow-running queries
- Designing performant database schemas
- Optimizing application response times
- Reducing database load and costs
- Improving scalability for growing datasets
- Analyzing EXPLAIN query plans
- Implementing efficient indexes
- Resolving N+1 query problems

## Do not use this skill when

- The task is unrelated to sql optimization patterns
- You need a different domain or tool outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.
- If detailed examples are required, open `resources/implementation-playbook.md`.

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.

## When to Use

- Use when Master SQL query optimization, indexing strategies, and EXPLAIN analysis to dramatically improve database performance and eliminate slow queries. Use when debugging slow queries, designing database...

---
name: dotnet-backend-patterns
type: reference
description: "Provides .NET and ASP.NET Core patterns for REST APIs, Entity Framework, dependency injection, and middleware. Use when working with C# files (*.cs, *.csproj) or when the user mentions .NET, ASP.NET Core, C#, or Entity Framework."
paths: ["**/*.cs", "**/*.csproj", "**/*.sln", "**/appsettings*.json"]
effort: 3
allowed-tools: Read, Glob, Grep
user-invocable: true
when_to_use: "When building C#/.NET backend APIs, MCP servers, or enterprise applications with Entity Framework or Dapper"
---

# .NET Backend Development Patterns

Master C#/.NET patterns for building production-grade APIs, MCP servers, and enterprise backends with modern best practices (2024/2025).

## Use this skill when

- Developing new .NET Web APIs or MCP servers
- Reviewing C# code for quality and performance
- Designing service architectures with dependency injection
- Implementing caching strategies with Redis
- Writing unit and integration tests
- Optimizing database access with EF Core or Dapper
- Configuring applications with IOptions pattern
- Handling errors and implementing resilience patterns

## Do not use this skill when

- The project is not using .NET or C#
- You only need frontend or client guidance
- The task is unrelated to backend architecture

## Instructions

- Define architecture boundaries, modules, and layering.
- Apply DI, async patterns, and resilience strategies.
- Validate data access performance and caching.
- Add tests and observability for critical flows.
- If detailed patterns are required, open `resources/implementation-playbook.md`.

## Resources

- `resources/implementation-playbook.md` for detailed .NET patterns and examples.

## When to Use

- Use when Master C#/.NET backend development patterns for building robust APIs, MCP servers, and enterprise applications. Covers async/await, dependency injection, Entity Framework Core, Dapper, configuratio...

# JUJU Virtual Office

**JUJU Virtual Office** is an interactive 2.5D virtual software studio designed to visualize authentic development, creative, content, QA, and deployment workflows through animated characters.

> Project status: **Planning and foundation**. The approved office image is a visual design reference, not a deployed application or a claim of live functionality.

## Product direction

- A detailed isometric office with glass meeting rooms, furniture, animated workstations, and expressive 3D-style characters.
- Ten representative roles: Project Manager, Team Lead, Senior Developer, Developer, Creative Designer, QA Engineer, DevOps Engineer, Analyst, Content Writer, and Social Media Specialist.
- Clickable employees, task context, project navigation, status bubbles, and a verifiable activity feed.
- Live operational mode backed by authenticated, read-only task evidence; separately isolated portfolio demo mode with clearly labelled synthetic scenarios.
- Browser-side animation rendering with resource-aware server integration.

## Architecture principles

1. JUJU's existing Workspace → Project → Job model and authoritative operational records remain the source of truth.
2. The office is a visualization layer, not another runner, job scheduler, or autonomous execution authority.
3. Every live status identifies its provenance and freshness; unverified or missing activity never appears as confirmed work.
4. The public repository contains no credentials, private task content, internal host configuration, or sensitive logs.
5. Work follows isolated task branches, pull requests, and the established self-hosted JUJU validation/release process.

## Planning documents

The implementation roadmap, visual specification, event contract, security boundaries, and progress log are maintained in the `docs/` directory.

## Portfolio presentation

A public demo will reproduce the actual application experience using demonstrably synthetic tasks. Private operational integrations and secrets remain outside the public demonstration.

## Development status

Application implementation, live integration, and deployment have not yet been completed. See the project plan and issue tracker for verified progress.

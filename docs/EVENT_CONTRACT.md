# Event and Role Projection Contract

Status: **proposed; exact API mapping requires live integration preflight**.

## Authority

An existing execution control plane owns Jobs, stages, approvals, worker events and outcomes. The virtual office is a read-only observer. It may keep a bounded in-memory visual projection but **must not** become the durable authority for task progress, approvals, deployments or logs.

## Proposed safe event shape

```json
{
  "event_id": "example-event-id",
  "job_id": "example-job",
  "project_id": "demo-project",
  "phase": "testing",
  "state": "running",
  "role": "qa",
  "summary": "Running regression checks",
  "observed_at": "2026-11-24T12:00:00Z",
  "evidence_url": null,
  "confidence": "verified",
  "mode": "demo"
}
```

Operational event schemas must be finalized against authenticated, authorized source records; this example is synthetic.

## Stage projection

| Source stage or area | Primary visual role | Work animation |
| --- | --- | --- |
| Intake, planning, requirements | Project Manager | Planning, reading board |
| Architecture, assessment, review | Team Lead | Evaluating, discussing |
| Code change, debugging, PR review | Developer / Senior Developer | Coding or reviewing based on observed action |
| UI design, asset production | Creative Designer | Drawing/tablet work |
| Editorial copy, documentation, long-form content | Content Writer | Writing and editing |
| Social strategy, publishing preparation, campaigns | Social Media Specialist | Campaign planning/calendar work |
| Test execution, browser QA, acceptance | QA Engineer | Running/checking tests |
| Build, deploy, infrastructure operations | DevOps Engineer | Pipeline and server monitoring |
| Research, evidence review | Analyst | Investigating/reading |

These are projections, not claims of independently running agents. When the source does not establish a specific worker/action, use a neutral truthful role state rather than inventing concurrent activity.

## State vocabulary

`queued`, `planning`, `investigating`, `running`, `reviewing`, `testing`, `deploying`, `awaiting_approval`, `blocked`, `failed`, `succeeded`, `cancelled`, `idle`, `disconnected`, `stale`, and `unknown`.

The frontend may use additional cosmetic animation substates, but it cannot strengthen source confidence or claim completion without evidence.

## Correctness rules

1. Initial connection receives an authorized snapshot, then timestamped incremental events.
2. Every event is deduplicated by identity and applied in source order; reconnect reconciles the latest canonical snapshot.
3. A missing or expired heartbeat changes the visual state to **stale**, never permanently **running**.
4. A failed action displays the actual bounded, sanitized failure and next known action when available.
5. Multiple real active jobs may animate multiple roles; task counts and employee occupancy must not be fabricated to fill the office.
6. A success state requires authoritative terminal evidence; a successful command alone is insufficient if testing or release acceptance is pending.
7. Private logs, credentials, client details and raw private model reasoning never enter public payloads, demo fixtures or frontend bundles.
8. Demo events use a separate synthetic provider and persistent **DEMO** labelling; it must never call the live backend.

## Future controls

Version one is read-only. Any task-triggering, approval or deployment UI requires a separate authorization and architecture assessment and must use the existing control process.

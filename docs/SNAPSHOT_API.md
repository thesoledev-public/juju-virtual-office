# Read-Only Office Snapshot API (frontend v0.1)

Status: **frontend consumer contract implemented; private provider not implemented**.

Request: `GET /api/office/v1/snapshot` when served at a domain root, or `GET /office/api/office/v1/snapshot` when served under `/office/`. Browser sends same-origin session credentials. The deployed reverse proxy must route this to a **private authenticated adapter**, not to public demo fixtures.

## Response (example fields only)

```json
{
  "schema_version": "1.0",
  "mode": "live",
  "observed_at": "2026-11-25T00:00:00Z",
  "projects": [
    { "id": "authorized-project-id", "name": "Authorized Project", "subtitle": "Current work", "icon": "A", "color": "blue", "progress": null, "state": "running" }
  ],
  "staff": [
    { "id": "dani", "name": "Virtual Senior Developer", "role": "Senior Developer", "department": "Development", "project_id": "authorized-project-id", "state": "running", "task": "Implement authorized change", "bubble": "Coding", "job_id": "authorized-job-id", "stage": "Coding", "pipeline": 0, "evidence_url": null }
  ],
  "activity": [
    { "id": "authorized-event-id", "project_id": "authorized-project-id", "message": "Verified transition", "status": "reviewing", "when": "Just now" }
  ]
}
```

This example is **not** a report of real activity. The sample date and identifiers are explanatory placeholders.

## Role slots

The frontend projects onto ten stable, fixed visual slots. They are **role avatars**, not identity claims. A single worker/job may contribute to more than one stage, but the adapter must not invent parallel active jobs to fill all positions.

| Slot | Role |
| --- | --- |
| `maya` | Project Manager |
| `leo` | Team Lead |
| `dani` | Senior Developer |
| `noah` | Developer |
| `aria` | Creative Designer |
| `erin` | QA Engineer |
| `kai` | DevOps Engineer |
| `avery` | Business Analyst |
| `sophie` | Content Writer |
| `milo` | Social Media Specialist |

When no authorized job is assigned to a slot, omit the record and the browser displays that character as idle/available. Missing project records cannot be replaced with public demo projects in live mode.

## Truth and freshness

- The adapter must set `mode: "live"`, an actual `observed_at` timestamp, and return only authorized fields for the current operator's session/RBAC view. Frontend rejects any demo-mode payload at this endpoint.
- The frontend marks the entire role projection **stale** if `observed_at` is older than 45 seconds. A request failure replaces the current snapshot with an empty/disconnected projection; it does not keep old green working indicators.
- Never infer that a job is complete solely from an exit code. Use canonical terminal stage/outcome, evidence and acceptance.
- `progress` must be `null` unless a source-defined real progress metric exists; there is no arbitrary percent completion calculation for live projects.
- `task`, `bubble`, `message`, `name` and IDs are bounded, sanitized strings. The frontend HTML-escapes all displayed fields and rejects non-HTTP evidence links, but the adapter is still responsible for authorization, secrecy and provenance.
- The frontend polls only once approximately every 12 seconds while visible. Do not implement per-avatar Control Center SSE or per-job database polling. If a selected-job detail stream is later necessary, limit to one active authorized subscription.

## Known future work

The frontend currently does **not** deduplicate or reconcile incremental event IDs because it consumes snapshots only; a live streaming extension must use authoritative IDs, ordering, reconnect and permission revocation tests before release. Error handling, session renewal and CSRF/auth scope must be tested with the current JUJU Control Center rather than assumed.

# Interactive vertical slice (M1/M2 early work)

This document describes the running implementation, not an assertion of production acceptance.

## Run locally

```bash
npm test
npm run check
npm start
```

Visit `http://127.0.0.1:4381`. The static runtime requires Node 20+ and **no third-party npm dependencies**. In the JUJU host environment, the existing Nginx Proxy Manager is the reverse proxy; `npm_proxy` is the shared Docker network, not an npm package registry proxy.

## What exists

- Artistically generated 2.5D isometric environment, an original derivative of the user-approved visual target, including a Content & Social workstation.
- One atlas of ten distinct character-role visuals plus an experimental two-frame seated typing atlas for the two developers, positioned as clickable independent office sprites with selection halo, ambient motion and working/status speech. Active non-developer roles now have distinct, gentle desk gestures; the social specialist has a bounded walking loop. Idle/stale/offline roles do not play working animations, and `prefers-reduced-motion` disables them.
- Navy chrome, project filtering, navigation, task cards, inspector, pipeline, project status, activity ticker, search, zoom/pan and keyboard-focusable worker controls.
- An **always labelled synthetic DEMO**; the Connect live control expects an authenticated, same-origin `/api/office/v1/snapshot` and deliberately displays OFFLINE instead of pretending there is live work.
- Snapshot validation, HTML escaping, URL validation and stale-state handling.
- Browser-only same-origin fallback at `auto.juju-mini.local/office/` to the existing authenticated JUJU `GET /api/v1/jobs` API, mapping explicit stages to virtual roles. For a generic execution stage, only narrowly phrased action-and-object titles (e.g. `Run regression tests`) assign a role; broad/ambiguous titles stay unassigned. This is not yet authenticated-browser validated.
- No remote services, telemetry, private token or arbitrary external write required for the demo.
- Source checks currently run locally with Node's built-in runner. No GitHub-hosted CI is included; any automated source validation must be wired through JUJU's approved self-hosted runner before release.

## What is NOT complete

- The approved mockup's high-fidelity full walk → sit → type → stand sequences and furniture occlusion. Two developers now have a preliminary seated two-frame pose, but it still has edge artifacts, subtle hand movement and no walking-to-desk transition. This is a **vertical slice, not final art acceptance**.
- The authorized JUJU read-only adapter, source state/identity validation, per-job detail and live event reconciliation. These belong in the private integration and require host preflight and RBAC checks.
- NPM Custom Location on `juju-mini`, real LAN curl/browser proof and uptime/resource measurement. The existing DNS and root Control Center route are already present; neither should be replaced.
- Mobile and accessibility acceptance, compatibility across browser engines and screenshot comparison approval.

## Deployment shape (partly verified, publication blocked)

- `juju-office-web` is now a bounded, **running internal sidecar**, installed by approved JUJU Job #4489 from public revision `a0ea200b09c2ec747531c36234b0bf74d531d1eb`, joined to existing `npm_proxy`. It reuses the exact already cached NPM image ID as its Node executable (no pull/build), with read-only source/root filesystem, unprivileged user, 128 MiB memory and 12% CPU caps. The NPM container observed HTTP 200 for the page, JavaScript and art. This is **not the public LAN route**.
- An earlier resource-capped systemd fallback `juju-office.service` also runs internally at exact revision `9ad08b7a8ecc80ad5b4d6629ad0dc92ef416b53a`, but NPM cannot reach its host bridge. Keep it intact for rollback until the sidecar and route are fully accepted.
- Host preflight confirmed the optional Node service target and port are not occupied. The USB-backed runner volume has ample free space, but root still has only ~6 GiB; use the systemd preview approach if deployed, rather than a Docker image pull/build. NPM Custom Location work must remain a separately validated operation.
- Requested address is **only** `http://auto.juju-mini.local/office/` → existing NPM proxy host → path-preserving `/office/` Custom Location → `juju-office-web:4381`; no new hostname or DNS changes.
- `auto.juju-mini.local` currently serves the legacy JUJU Control Center. Never replace its root mapping. The optional `/office/` path requires explicit collision and asset path validation, since the current static page expects absolute `/api/office/` and relative static assets.
- The sidecar runs with `PUBLIC_BASE_PATH=/office`; relative assets and same-origin live API calls remain under `/office/`. This **does not** configure the private adapter or NPM location itself. The first management discovery Job #4490 was stopped by JUJU's existing internal-disk guard before any custom command; preserve that safety gate and investigate storage before retrying host mutations.
- Private adapter is same-origin behind the reverse proxy, with the existing authenticated JUJU authorization boundary; it must not be included in public assets or expose raw events.

## Implementation guardrails

1. No second workflow engine, queue or scheduler. UI is projection only.
2. No fabricated claims in LIVE mode. No source record → idle/unassigned, connection lost → disconnected, old heartbeat → stale.
3. Preserve the user's existing JUJU self-hosted runner and current Control Center route.
4. Do not deploy from the public CI workflow. Deploy through approved JUJU job after verified preflight.

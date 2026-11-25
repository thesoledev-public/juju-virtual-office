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
- One atlas of ten distinct character-role visuals plus an experimental two-frame seated typing atlas for the two developers, positioned as clickable independent office sprites with selection halo, ambient motion and working/status speech.
- Navy chrome, project filtering, navigation, task cards, inspector, pipeline, project status, activity ticker, search, zoom/pan and keyboard-focusable worker controls.
- An **always labelled synthetic DEMO**; the Connect live control expects an authenticated, same-origin `/api/office/v1/snapshot` and deliberately displays OFFLINE instead of pretending there is live work.
- Snapshot validation, HTML escaping, URL validation and stale-state handling.
- Browser-only same-origin fallback at `auto.juju-mini.local/office/` to the existing authenticated JUJU `GET /api/v1/jobs` API, mapping only unambiguous stages to virtual roles; generic execution remains unassigned. This is not yet real-host validated.
- No remote services, telemetry, private token or arbitrary external write required for the demo.
- Source checks currently run locally with Node's built-in runner. No GitHub-hosted CI is included; any automated source validation must be wired through JUJU's approved self-hosted runner before release.

## What is NOT complete

- The approved mockup's high-fidelity full walk → sit → type → stand sequences and furniture occlusion. Two developers now have a preliminary seated two-frame pose, but it still has edge artifacts, subtle hand movement and no walking-to-desk transition. This is a **vertical slice, not final art acceptance**.
- The authorized JUJU read-only adapter, source state/identity validation, per-job detail and live event reconciliation. These belong in the private integration and require host preflight and RBAC checks.
- NPM/DNS configuration on `juju-mini`, real LAN curl/browser proof and uptime/resource measurement.
- Mobile and accessibility acceptance, compatibility across browser engines and screenshot comparison approval.

## Deployment shape (requires host verification)

- `juju-office-web` built from the public repository and joined to existing external Docker network `npm_proxy`.
- **Lower-resource alternative for the current capacity constraint:** use the host's already-installed Node runtime under a dedicated, separately stoppable, CPU/memory-capped `juju-office.service`, bind only to the existing `npm_proxy` Docker bridge gateway, and forward NPM to that bridge address on port 4381. The public repository includes a guarded service template and a pure rendering script; installation/activation still requires a separate approved JUJU job and route tests.
- Host preflight confirmed the optional Node service target and port are not occupied. The USB-backed runner volume has ample free space, but root still has only ~6 GiB; use the systemd preview approach if deployed, rather than a Docker image pull/build. NPM Custom Location work must remain a separately validated operation.
- Proposed independent host: `juju-virtual-office.juju.home.arpa` → NPM proxy host → `juju-office-web:4381`.
- `auto.juju-mini.local` currently serves the legacy JUJU Control Center. Never replace its root mapping. The optional `/office/` path requires explicit collision and asset path validation, since the current static page expects absolute `/api/office/` and relative static assets.
- If a carefully validated NPM Custom Location forwards `/office/` with its prefix intact, start the web service with `PUBLIC_BASE_PATH=/office`; relative assets and same-origin live API calls remain under `/office/`. This **does not** configure the private adapter or NPM location itself.
- Private adapter is same-origin behind the reverse proxy, with the existing authenticated JUJU authorization boundary; it must not be included in public assets or expose raw events.

## Implementation guardrails

1. No second workflow engine, queue or scheduler. UI is projection only.
2. No fabricated claims in LIVE mode. No source record → idle/unassigned, connection lost → disconnected, old heartbeat → stale.
3. Preserve the user's existing JUJU self-hosted runner and current Control Center route.
4. Do not deploy from the public CI workflow. Deploy through approved JUJU job after verified preflight.

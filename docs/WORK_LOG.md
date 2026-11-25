# JUJU Virtual Office — Durable Work Log

This is a factual work log. Planned tasks are not reported as implemented, tested or deployed.

## 2026-11-24 — Planning baseline

- Selected repository: `thesoledev-public/juju-virtual-office`, **public**, initially empty with `main` as default branch.
- Approved visual direction: user's specific detailed 2.5D `JUJU OFFICE` reference image; no stylistic substitution.
- Scope extended with **Content Writer** and **Social Media Specialist**, bringing the proposed role roster to ten.
- Architecture decision: standalone read-only graphical observer of the existing control plane. No duplicate scheduler, AI agents, or job-state database.
- Security decision: public source and synthetic portfolio fixtures only; sensitive integration and host details documented in a separate private control repository.
- Deployment decision: use the established JUJU-managed GitHub Actions/self-hosted runner workflow and existing local DNS/proxy infrastructure. Live host state and routing remain to be verified before changes.
- Plan and specification added for review. This entry is **documentation work**, not implementation/QA/release evidence.

## 2026-11-24 — First interactive implementation branch

- Foundation documents merged to `main` in commit `760abcb7b4a797a835a3bd1e0771569d55ad639c`; public epic is issue #9 and detailed stages are linked there.
- Generated an original detailed office floor/environment artwork inspired by the approved reference, plus a distinct ten-role character atlas. Both are public-safe synthetic assets; the exact reference screenshot itself remains private.
- Created an interactive demo UI with selection, task inspector, project filters, navigation views, search, activity feed, pan/zoom, status effects and Content & Social roles in draft PR #10.
- Added a small Node static service, a Docker Compose service for the existing `npm_proxy` network and optional path-prefix support. No local deployment or route mutation has occurred.
- Local `npm test`: **5 passed, 0 failed**; `npm run check`: passed. No comprehensive browser visual QA yet.
- A deliberate `/office/` path-prefix test passed: HTTP 308 redirect for `/office`, HTTP 200 for page and static assets, HTTP 501 for the absent authenticated adapter, and HTTP 404 at the service root. This validates the local app behavior, **not** actual NPM/Windows client routing.
- Added a frontend snapshot contract (`docs/SNAPSHOT_API.md`) with ten stable role slots and explicit missing-data/staleness rules.

## 2026-11-25 — Approved end-to-end continuation

- Added `site/juju-live.mjs`: a read-only in-browser mapping of the **existing** Control Center `GET /api/v1/jobs` output into verified role/state snapshots when hosted at `auto.juju-mini.local/office/`. No tokens or server-side scheduler created. Ambiguous source stages do not activate virtual employees.
- Added tests for auth-safe fail-closed projection, ambiguous execution stages, time-staleness, role mapping and unknown completion percentages. Local test suite now passes **11 of 11**; syntax check passes.
- Read-only JUJU M0C issue #4478 queued to independently verify current root disk capacity and `/office/` routing safety before deploying any service. Root legacy Control Center ownership must not change.
- Browser UAT and actual deployed live data remain unverified. Do not call this a completed production release.

## 2026-11-25 — Preview capacity and low-impact service design

- M0C #4478 completed on the actual `juju-mini` runner: root filesystem ~6.5 GiB free, available RAM ~3.6 GiB, 1-minute load ~12.4, existing Control Center `/` returned 303, `/office/` returned 404, unauthenticated JUJU jobs API returned 401. No hosting changes were made.
- M0D #4479 identified host Node **v24.13.0**, existing Nginx Proxy Manager container, Docker network, and external ext4 storage at `/srv/juju-work`; follow-up M0E #4480 measured ~184.4 GiB free on this external volume and ~6.3 GiB remaining on root.
- M0E verified the proposed `/srv/projects/juju-virtual-office` target, `juju-office.service` systemd unit name and port 4381 are free, and Docker `npm_proxy` exposes a bridge gateway. These are read-only compatibility results, **not deployed revision evidence**.
- Implemented a separately stoppable host Node service template with 128 MB / 12% CPU limits and a validated NPM bridge binding. This avoids pulling a new Docker image onto the low-free-space root volume. Local tests now **13 passed** and syntax checks pass.
- NPM, DNS, authenticated live stage transitions and browser acceptance remain pending. The legacy Control Center root route must remain unchanged.
- Removed a draft GitHub-hosted CI workflow from this branch to keep source validation aligned with JUJU's existing self-hosted runner governance.
- Known art gap: the generated characters still need consistent seat/walk/type animation frames, silhouette edge cleanup, depth/occlusion and visual comparison before this can be considered faithful to the mockup.
- Private JUJU host M0 read-only preflight succeeded (private issue #4457, Actions run `45539772630`); selected read-only capacity/routing evidence is being gathered separately because full stdout is local-only.

## 2026-11-25 — First isolated preview attempt and safe rollback

- An exact-revision, approved JUJU modifying job #4481 cloned public revision `f1fe06a5cd61c838af593bbc1cc3908a75ed8369` into `/srv/projects/juju-virtual-office`. All **13** host-side automated tests passed and the service unit was enabled, but its immediately following bridge HTTP check failed with curl exit code 7. The job was correctly marked **failed**; this is not a successful deployment.
- Separate read-only diagnosis #4482 confirmed the installer rollback left the systemd unit **inactive**, removed it from `/etc/systemd/system/`, archived the failed unit in the office audit directory, and freed port 4381. The site is therefore still **unpublished**.
- The initial failure is consistent with the service's asynchronous startup racing an immediate HTTP request on this loaded host. Added a bounded readiness poll (20 attempts, 0.5-second spacing, quit early on service failure) plus static installer safety regression checks. Local tests now **15 passed, 0 failed**. This hypothesis still requires an actual second host deployment to confirm.
- Existing `auto.juju-mini.local/` root and Nginx Proxy Manager routes have **not** been changed.

## Pending evidence

- Final read-only host/DNS/proxy evidence and scoped project onboarding.
- Exact reference asset inclusion and visual asset pipeline.
- Working character animations and interactive office.
- Authenticated stage/status integration and reconnection.
- Browser UAT, resource benchmarks, exact deployed revision, and local route acceptance.

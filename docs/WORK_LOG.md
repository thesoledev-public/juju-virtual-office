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

## 2026-11-25 — Further service isolation and operator boot behavior

- The retry of #4481 with the bounded 10-second readiness poll also **failed**, despite all **15** host-side checks passing; the failed unit was stopped and rolled back. Startup timing alone did not explain the problem.
- Read-only plus bounded ephemeral tests #4483 and #4484 isolated network versus service behavior: the directly invoked Node server successfully served **HTTP 200** on the intended NPM bridge gateway, but a constrained transient systemd service did not. Persistent host/service integration is **not** yet functioning, and the NPM route remains unchanged.
- A further approved scoped #4485 comparison was queued to identify whether systemd launch configuration or its resource properties cause the difference. No broad system configuration changes are authorized.
- Added host-specific automatic LIVE connection at the exact `auto.juju-mini.local/office/` origin, reusing existing user authentication; the public/portfolio origin continues to default to synthetic DEMO. One new regression test raises local results to **16 passed**.
- Follow-up property isolation #4485 returned systemd exit **127** in both minimally constrained and fully sandboxed launches. Read-only #4486 confirmed the working Node v24.13.0 executable lives inside JUJU's per-user NVM installation; there is no `/usr/bin/node` or `/usr/local/bin/node`. The service cannot rely on the runner's shell PATH.
- Updated the public installer and template to copy this specific validated Node binary to a root-owned, version-pinned executable on the spacious external work volume; the unit executes it by absolute path and retains `ProtectHome=true`. Source/target SHA-256 equality is required. No Docker image is built, and the installed runtime is limited to this office project. This fix has **not yet been proven on the host**. Local suite is **17 passed**.
- Third #4481 host attempt **proved the Node path fix**: the isolated systemd service returned HTTP **200** for health, `/office/`, JavaScript and scene artwork; `/office/api/office/v1/snapshot` correctly returned **501** (adapter absent), and service root `/` returned **404**. The job then failed solely because its NPM-container-to-service request could not connect; the rollback stopped the service. The operator-facing URL remains **unpublished**.
- Revised installer acceptance: bridge-path status and resource cap are mandatory; NPM-container reachability is now a clearly reported, bounded, nonfatal **separate integration gate**. A verified healthy internal preview can be left running with explicit `office_preview_publication=not_published`, pending an independently approved NPM route. No existing NPM configuration has been changed.
- Follow-up #4488 read-only NPM topology confirmed the NPM container is on `npm_proxy` and its `jc21/nginx-proxy-manager:latest` image is **already cached**. No standalone `node:*` image was cached. Since NPM-to-host-bridge could not connect, a new Docker **sidecar candidate** uses NPM's exact preexisting image ID solely for its Node runtime, launched as a separate 128 MB / 0.12 CPU read-only container on that shared network, without image builds/pulls or exposed host ports. Its proof requires NPM-container HTTP checks and reversible failure cleanup. This candidate is **not deployed or published**; local tests now **19 passed**.
- The corrected #4481 internal preview install subsequently **succeeded** at revision `9ad08b7a8ecc80ad5b4d6629ad0dc92ef416b53a`: resource-capped `juju-office.service` is active with six passing HTTP checks; its NPM reachability marker is `no` and publication remains `not_published`. Sidecar tests will use a **separate** `/srv/projects/juju-virtual-office-sidecar` checkout so they cannot rewrite files served by that working systemd instance.

## Pending evidence

- Final read-only host/DNS/proxy evidence and scoped project onboarding.
- Exact reference asset inclusion and visual asset pipeline.
- Working character animations and interactive office.
- Authenticated stage/status integration and reconnection.
- Browser UAT, resource benchmarks, exact deployed revision, and local route acceptance.

## 2026-11-25 — NPM-visible sidecar verified; safe publication hold

- Approved JUJU #4489 [Actions run 45681923657](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45681923657) **succeeded**. An isolated `juju-office-web` container runs on `npm_proxy` with 128 MiB memory / 12% CPU caps, no image pull/build, no host-published port, read-only source and unprivileged user. The running source is exact commit `a0ea200b09c2ec747531c36234b0bf74d531d1eb`.
- Directly from inside NPM, `/healthz`, `/office/`, `/office/app.js`, and `/office/assets/office-floor.png` each returned **HTTP 200**; the intentionally unimplemented private adapter returned **501**, and service `/` returned **404**. The runner explicitly reported `office_sidecar_publication=not_published`.
- Read-only NPM management discovery #4490 [Actions run 45681995916](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45681995916) **failed before executing its command**: JUJU's standard runner reported `insufficient internal disk for durable JUJU state`. Its hard floor is 5 GiB on the internal project filesystem. This gate must remain in force; no NPM host edit, service cleanup or project migration is authorized by the failed probe.
- Improved conservative LIVE role alignment: explicit high-confidence task verbs can identify an employee during a generic execution stage, but ambiguous titles and queued/stale/unknown jobs remain inactive. Added distinct lightweight role gestures with reduced-motion support. Local suite now **21 passed** and syntax checks pass. These changes are source-only until a separately verified host upgrade.
- **Public `/office/` remains unavailable** pending root-space recovery, scoped NPM API/config backup and route modification, authenticated task/RBAC checks, LAN browser/visual UAT, and final performance review. Existing Control Center `/` is unchanged.
- One bounded same-issue retry of read-only #4490 also failed before its command at the unchanged internal-disk guard ([Actions run 45682869967](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45682869967)). Further host changes were stopped. Private blocker [#4491](https://github.com/thesoledev-public/juju-automation-platform/issues/4491) tracks safe storage diagnosis/recovery and route acceptance; do not bypass the runner or bulk-prune unrelated JUJU data.

## 2026-11-25 — Verified host route and interactive browser QA

- The operator recovered root headroom through a precisely verified legacy-backup offload. JUJU's normal 5 GiB runner safety guard remained enabled; subsequent read-only jobs resumed. No Docker mass prune or unrelated project deletion was used.
- Scoped JUJU work added one NPM Custom Location for `auto.juju-mini.local/office/`. The initial modifying job reported an ambiguous failed runner status despite a success marker, so the release claim is based on a **separate successful read-only verification**: [JUJU run 45691943064](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45691943064). Actual host responses: `/office/` 200, app bundle 200, art 200, existing Control Center `/` 303, existing protected jobs API 401, absent optional private adapter 501. Exactly one persisted NPM `/office/` location and a valid Nginx configuration were confirmed. These prove server-side routing, **not** signed-in LAN browser access.
- A managed Chrome localhost **DEMO** preview visibly rendered the detailed office, overlaid role characters and speech bubbles, project rail, staff inspector and feed. Click interactions correctly selected Content Writer and Social Media Specialist and the Tasks view listed all ten specialists. This is browser visual and interaction evidence, not proof of real JUJU task updates.
- Standard local preview tooling initially supplied `--host`/`--port` flags that the standalone Node server ignored. Added safe support for those flags while preserving production `HOST`/`PORT` environment precedence, committed at `1d707775e5148bb6d99a10f07a6c6ca91fa385c1`. The **21 tests** still pass, with no external dependencies.
- A separately named capped canary of the latest revision was independently verified by [JUJU run 45692724529](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45692724529). The original live sidecar remained the NPM target while the newer one was staged. A distinct switch job was requested; do not claim the canary serves the LAN URL until its target and contents are independently verified.
- Remaining acceptance: live same-origin authenticated job projection and negative authorization behavior in a signed-in browser, actual LAN client DNS, refresh/restart persistence, final 2.5D character movement and occlusion parity, and resource/latency measurements. The draft PR remains unmerged pending acceptance.

## 2026-11-25 — Newer animated candidate now served through NPM

- A separate JUJU-approved Custom Location switch [run 45693001972](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45693001972) changed only the Office upstream to the already-tested canary. It passed the existing Control Center route checks and proved a cryptographic match between the NPM-delivered JavaScript and the new candidate, distinct from the previous version. The old Office process remains available as rollback.
- Independent read-only acceptance [run 45693707973](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45693707973) **succeeded**: live source revision `1d707775e5148bb6d99a10f07a6c6ca91fa385c1`, one matching persistent Office location and generated NPM block, page and art 200, root Control Center 303, protected jobs API 401, absent optional adapter 501, and correct latest asset digest. The new Office process is capped at 128 MiB / 0.12 CPU; about 5.8 GiB root storage remained at check time.
- This establishes a real host-side served Office version, **not** signed-in client-side LIVE-task acceptance or a finished portfolio-quality animation release. The public source PR remains draft pending those evidence gates.

## 2026-11-25 — Ambient office-life repair candidate (awaiting JUJU release)

- Follow-up from the operator's LAN inspection: the scene was visually frozen while LIVE showed `OFFLINE`, developer portraits were turned away from their monitors, and some standing role anchors intersected desks. This is direct operator acceptance feedback; do not treat the previous host-level HTTP 200 as a visual pass.
- Added a visual-only 14-second ambient scheduler with staggered coffee, chat, stretch, reading, phone and short-walk routines, plus separate walking/seat anchors. It runs in LIVE even when JUJU is unauthorized or disconnected; its actions contain no job ID, source, synthetic performance figure or claim of verified work. Demo deliberately includes four idle roles to show the ambient behaviors alongside six synthetic active specialists.
- Replaced the front-facing coding overlay with an image-generated **rear three-quarter** transparent Dani/Noah typing sheet aimed toward the desk monitors; optimized for delivery as a WebP asset. Original reference art remains intact. Added an actionable status panel that describes auth failure or adapter/transport errors, links back to JUJU Control Center only on the known same-origin host, and offers a retry without ever bypassing `jobs.view` authorization.
- Local `npm test`: **24 passed**; `npm run check`: **passed**. Managed Chrome preview verified the facing direction, per-role inspector, four ambient DEMO roles, LIVE failure banner and no invented live jobs; checked CSS walking motion. The browser preview cannot validate a signed-in LAN session.
- Separate [JUJU cleanup #4501](https://github.com/thesoledev-public/juju-automation-platform/issues/4501) **succeeded**; the old systemd preview and old Office sidecar were only stopped, not removed, with the current `juju-office-web-next` NPM upstream preserved.
- **Deployment/acceptance pending:** new source revision must be committed, staged by a new JUJU-controlled resource-capped sidecar, switched in the single NPM `/office/` location only after independent proof, and verified again without modifying the root Control Center. Authenticated browser LIVE projection and user LAN visual review remain open gates.

## 2026-11-25 — Stage evidence and renewed root-space blocker

- Public source repair was committed at `a6aca6bc9dba627f461ba2b98fdda1c61d960f7f`. Approved JUJU stage [#4502](https://github.com/thesoledev-public/juju-automation-platform/issues/4502), [Actions run 45700153299](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45700153299), printed host-side evidence for exact source SHA, all **24 tests**, running `juju-office-web-ambient`, full candidate HTTP path checks including rear WebP asset `200` and `image/webp`, and unchanged public route; **the JUJU runner nevertheless reported `failed`**. Such output is not independent proof of running state.
- Separate read-only verification [#4503](https://github.com/thesoledev-public/juju-automation-platform/issues/4503), [Actions run 45700382525](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45700382525), **failed before executing any inspection**: `JUJU_RUNNER_ERROR=insufficient internal disk for durable JUJU state`. The pre-existing 5 GiB root guard was not bypassed. This is fresh root-space pressure after the earlier successful verification; source checkout/assets alone cannot explain its magnitude.
- Therefore **no new live NPM switch was attempted**. The previous independently verified version is still the last verified active route. Root disk headroom and an independent running candidate check are required before publication. Do not infer new live status from the failed stage's internal markers.
- Local final visual review identified standing idle avatars too close to the planter/desk row, so the idle walkway coordinates were further tuned (without changing authenticated role mapping). This latest adjustment must receive a **new exact SHA and fresh staging evidence** after the disk gate clears; it is not what candidate #4502 served.

## 2026-11-25 — Bounded JUJU read-only retry confirms release hold

- At the operator's request to continue, requeued **the same** independent read-only JUJU #4503 once through the normal issue lifecycle. [Actions run 45704578865](https://github.com/thesoledev-public/juju-automation-platform/actions/runs/45704578865) again **failed before executing any host command**, reporting `JUJU_RUNNER_ERROR=insufficient internal disk for durable JUJU state`. No additional retry or workaround was used.
- Public branch head is `949191085405a672e1f6258721c029457f2c8bb3` with 24 passing tests and refined idle placement. This is **not deployed**; NPM has not been switched. The latest independently proven live source remains `1d707775e5148bb6d99a10f07a6c6ca91fa385c1`.
- To resume safely, obtain fresh root filesystem and heavy-directory measurements from the JUJU Mini operator or a separately permitted maintenance connection; verify USB mount and preservation of current recovery anchors; choose only a specifically identified disposable/offloadable target. Do not weaken JUJU's 5 GiB guard or prune Docker and backup directories broadly.

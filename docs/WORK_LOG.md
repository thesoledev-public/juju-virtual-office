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
- Removed a draft GitHub-hosted CI workflow from this branch to keep source validation aligned with JUJU's existing self-hosted runner governance.
- Known art gap: the generated characters still need consistent seat/walk/type animation frames, silhouette edge cleanup, depth/occlusion and visual comparison before this can be considered faithful to the mockup.
- Private JUJU host M0 read-only preflight succeeded (private issue #4457, Actions run `45539772630`); selected read-only capacity/routing evidence is being gathered separately because full stdout is local-only.

## Pending evidence

- Final read-only host/DNS/proxy evidence and scoped project onboarding.
- Exact reference asset inclusion and visual asset pipeline.
- Working character animations and interactive office.
- Authenticated stage/status integration and reconnection.
- Browser UAT, resource benchmarks, exact deployed revision, and local route acceptance.

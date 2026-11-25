# JUJU Virtual Office — Project Plan

Status: **approved scope, implementation pending**  
Plan version: **1.0**  
Planning baseline: **2026-11-24**  
Repository: `thesoledev-public/juju-virtual-office` (public)

## Product goal

Build a high-fidelity interactive 2.5D isometric software studio that represents observable work by an existing automation control plane as employees in an office. The primary audience is the private operator; a separate portfolio demonstration must use clearly labelled synthetic work and no private connections.

The exact user-approved `JUJU OFFICE` mockup is the visual acceptance reference. A flat background image, static character overlays, generic dashboard, pixel-art conversion, or a different art style is **not** an acceptable final result.

## Scope

- Detailed isometric office with the approved navy navigation, project cards, glass rooms, developer workstations, creative and QA areas, server room, task inspector, activity feed, and blue selection effects.
- Add a complementary **Content & Social** work area without losing the approved core composition.
- Ten virtual roles: Project Manager, Team Lead, Senior Developer, Developer, Creative Designer, QA Engineer, DevOps Engineer, Analyst, Content Writer, and Social Media Specialist.
- Independent character motion, sitting, typing, discussion, research, design, writing, QA, publishing-preparation, and idle animations; speech bubbles and mouse/touch selection.
- Real read-only work status based on authoritative job/stage evidence, including waiting, failure, blocked, approval, disconnected, and stale states.
- Functional project navigation and inspector; visible controls must have real behavior or remain hidden/disabled with an explanation.
- Separate authenticated live view and a visibly labelled, isolated synthetic portfolio demonstration.
- Local-network deployment, browser QA, accessibility, security and measured resource use.

## Explicit boundaries

- The office **does not** create a second coding agent, job queue, scheduler, operational database, or execution authority.
- Role characters are visual representations of stages and responsibilities; they are not claims that separate human or AI workers are running.
- Thought bubbles contain sanitized observable task summaries, never private model reasoning or unverifiable claims.
- Version one is **read-only**. Commands, approvals, and deployments cannot be triggered from the office UI until a separately approved and authenticated control design exists.
- Public source and demo assets must not contain real client task data, secrets, sensitive logs, or internal deployment configuration.

## Delivery milestones

| Milestone | Work | Acceptance evidence |
| --- | --- | --- |
| M0 — Foundation | Read-only infrastructure/API preflight, project onboarding, development configuration, reference asset pipeline, baseline resource measurements | Recorded compatibility and resource assessment; scoped integration contract |
| M1 — Visual fidelity | Layered office illustration, ten consistent character models/sprites, stations, background/foreground occlusion, animation atlas prototypes | Reference-comparison screenshots and verified animated character turn/sit/type cycle |
| M2 — Interactive simulation | Phaser scene, movement paths, collision, state machine, workstation occupancy, selection, speech bubbles and deterministic synthetic fixtures | Functional browser tests of movement and interaction, no decorative fake task claims |
| M3 — Operations interface | Projects, Tasks, Automation, selected employee panel, activity feed, search/filter where real, responsive and accessible states | Navigation, keyboard, loading/empty/error/retry tests pass |
| M4 — Live observer | Read-only authoritative job/stage adapter, freshness/provenance, stream reconnect, role mapping, safe summaries | Recorded real job transitions match displayed actors and source evidence |
| M5 — Hardening | Security, accessibility, performance, source gates, browser visual QA, disconnected/stale testing, resource limits | Automated checks pass; no material degradation of normal execution jobs |
| M6 — Release and portfolio | Local DNS/proxy route, exact-revision deployment, documented rollback, public-safe demo, screenshots and case study | Served SHA, routing, real-client browser UAT, live/demo separation and rollback evidence |

## Design and behavior requirements

1. Preserve the approved 2.5D visual identity, composition, lighting, character proportions and dashboard geometry. See [Visual Specification](VISUAL_SPEC.md).
2. Split the scene into independently renderable foreground/background objects and directional character atlases; animation must preserve perspective and depth ordering.
3. Use event-derived visual state: verified work events activate work animations; otherwise actors show accurate waiting, idle, disconnected or stale states.
4. Display the source and last-updated time when inspecting work. Do not invent metrics, progress percentages or employee output.
5. A task can move between role workstations as its actual workflow stages change. Concurrent role displays must be grounded in independently observed stages.
6. Project colours and filtered task visibility may change without changing the office's physical layout.

## Functional journeys

### Operator

Authenticate → open office → select a project or all authorized projects → inspect running/waiting/failed work → click an employee → inspect task, stage, source and evidence → follow real task links if authorized → return to office. Offline/expired/forbidden/empty states must remain truthful.

### Portfolio visitor

Open explicitly marked Demo → browse synthetic projects → trigger local example scenarios → observe role transitions → inspect the clearly synthetic task panel → view architecture/case study. Demo must never attempt private API access.

## Non-functional targets

- Heavy rendering and animation execute in the browser, not on the automation host.
- Prefer existing event and state infrastructure; add only a scoped read-only adapter if authentication or data-shape requirements justify it.
- Asset atlases and office layers are cacheable and optimized. Hidden tabs reduce or suspend animation work.
- Benchmark host CPU, RAM, disk and active job latency before/after installation. Exact budgets follow M0 measurements.
- Verify at least desktop 1920×1080 and 1366×768, plus a deliberate constrained/mobile presentation.
- Maintain keyboard access, readable inspector text, reduced-motion support, and recoverable network errors.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Single concept image cannot supply consistent multi-angle animation | Create reusable character models and render coherent directional sprite sheets; pass an early visual-fidelity gate |
| Illusory real-time activity | Canonical job-state mapping, timestamps, provenance, stale timeout and truthful empty states |
| Public source leaks operational data | Synthetic fixtures only, server-side read-only authorization, secret scanning, separate private operations documentation |
| Host resource contention | Browser-side renderer, conservative background service, benchmark and resource limits; no second worker plane |
| Local DNS/proxy collision | Reuse existing canonical local namespace and proxy manager; refuse to overwrite an occupied route |
| Incomplete visual matching | Screenshot comparison to approved reference at every major art milestone |

## Indicative schedule

Allow approximately **4–7 working weeks** for the complete high-fidelity scope, subject to the host/API preflight and animation asset production. This is an estimate, not evidence of progress or a delivery guarantee.

## Final definition of done

- The implemented office closely matches the approved visual reference and is genuinely layered/interactive.
- All ten roles are represented by consistent animated characters and mapped to evidence-based statuses.
- Click, navigation, panel, speech bubbles, movement and failure states function correctly.
- Live view shows only authorized, verifiable operational data; demo never accesses live data.
- Exact-revision build, deployment, browser QA, performance baseline comparison and rollback evidence are recorded.
- The application is reachable through the approved local route and does not materially impair the automation control plane.
- Documentation and an accurate public portfolio case study are complete.

## Tracking

Milestones and issues in this public repository contain only portfolio-safe engineering descriptions. Sensitive execution, operational wiring and environment actions belong in the private control repository. See [Work Log](WORK_LOG.md).

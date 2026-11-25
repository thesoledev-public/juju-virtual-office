# Security and Portfolio Demo Policy

The GitHub repository is **public**. Treat every committed file, screenshot, demo fixture, issue, action log and build artifact as potentially visible outside the development team.

## Public material allowed

- Source code for the virtual office renderer and generic, read-only presentation contract.
- Original or licensed assets cleared for public use.
- Synthetic project names, tasks, progress, code samples and activity timelines, visibly marked **DEMO**.
- General architecture, tests, screenshots and a portfolio case study without operational identifiers.

## Public material prohibited

- Tokens, cookies, keys, private host/user credentials, secret configuration, internal network inventory.
- Real client names, private project descriptions, unredacted logs, incident evidence or access URLs without explicit approval.
- Internal connection mappings, credential references, sensitive deployment instructions and control-plane configuration.
- A public demo that can reach the live operational backend, directly or through a proxy.

## Private live mode

- Authentication and authorization are enforced server-side for every task/project view.
- A scoped, read-only integration accesses permitted operational records; frontend JavaScript never receives service credentials.
- Invalid/expired sessions yield a secure sign-in/retry state; disconnected/stale responses show truthful states.
- Link-outs and logs are redacted/filtered for the user's permissions.
- All changes to execution control and deployment authority remain outside scope for version one.

## Test obligations

Verify repository secret scanning, access-denied behavior, cross-project permissions, API failure/timeout behavior, demo isolation, response redaction, and no unexpected external data requests from demo mode.

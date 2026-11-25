export const LIVE_STALE_AFTER_MS = 45_000;
export const STATES = new Set(['queued', 'planning', 'investigating', 'running', 'reviewing', 'testing', 'deploying', 'awaiting_approval', 'blocked', 'failed', 'succeeded', 'cancelled', 'idle', 'disconnected', 'stale', 'unknown']);
export const ROLE_IDS = ['maya', 'leo', 'dani', 'noah', 'aria', 'erin', 'kai', 'avery', 'sophie', 'milo'];

export function safeString(input, limit = 160) {
  return typeof input === 'string' ? input.slice(0, limit) : '';
}
export function escapeHTML(input) {
  return String(input ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
export function normalizedState(state) {
  return STATES.has(state) ? state : 'unknown';
}
export function isActive(state) {
  return ['planning', 'investigating', 'running', 'reviewing', 'testing', 'deploying'].includes(normalizedState(state));
}
export function stateText(state) {
  return ({ running: 'In progress', reviewing: 'In review', testing: 'Testing', deploying: 'Deploying', planning: 'Planning', investigating: 'Investigating', awaiting_approval: 'Needs approval', disconnected: 'Disconnected', stale: 'Data stale', succeeded: 'Succeeded', blocked: 'Blocked', failed: 'Failed', queued: 'Queued', cancelled: 'Cancelled', idle: 'Available', unknown: 'Unknown' })[normalizedState(state)];
}
export function sanitizeSnapshot(payload, now = Date.now()) {
  if (!payload || payload.schema_version !== '1.0' || payload.mode !== 'live' || !Array.isArray(payload.staff) || !Array.isArray(payload.projects)) {
    throw new Error('Unrecognized office snapshot');
  }
  const observed = Date.parse(payload.observed_at);
  if (!Number.isFinite(observed) || observed > now + 30_000) throw new Error('Invalid observed_at');
  const stale = now - observed > LIVE_STALE_AFTER_MS;
  return {
    schema_version: '1.0', mode: 'live', observed_at: payload.observed_at, stale,
    projects: payload.projects.slice(0, 30).map(p => ({
      id: safeString(p.id, 60), name: safeString(p.name, 70), subtitle: safeString(p.subtitle, 100),
      icon: safeString(p.icon, 2), color: ['violet', 'teal', 'blue'].includes(p.color) ? p.color : 'blue',
      progress: Number.isFinite(p.progress) ? Math.min(100, Math.max(0, p.progress)) : null,
      state: normalizedState(p.state)
    })),
    staff: payload.staff.slice(0, 40).filter(p => ROLE_IDS.includes(p.id)).map(p => ({
      id: p.id, name: safeString(p.name, 70), role: safeString(p.role, 70), department: safeString(p.department, 80),
      project_id: safeString(p.project_id, 60),
      state: stale ? 'stale' : normalizedState(p.state), task: stale ? 'Latest job state not confirmed' : safeString(p.task, 180),
      bubble: stale ? 'Waiting for updates' : safeString(p.bubble, 50),
      job_id: safeString(p.job_id, 100), stage: safeString(p.stage, 70),
      pipeline: Number.isInteger(p.pipeline) ? Math.max(0, Math.min(3, p.pipeline)) : 0,
      evidence_url: isSafeEvidenceUrl(p.evidence_url) ? p.evidence_url : null
    })),
    activity: (Array.isArray(payload.activity) ? payload.activity : []).slice(0, 50).map(a => ({
      id: safeString(a.id, 80), project_id: safeString(a.project_id, 60),
      message: safeString(a.message, 200), status: normalizedState(a.status),
      when: safeString(a.when, 50)
    }))
  };
}
export function isSafeEvidenceUrl(value) {
  if (typeof value !== 'string') return false;
  try { const u = new URL(value); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; }
}

// Conservative, browser-only projection from JUJU's existing authenticated
// GET /api/v1/jobs endpoint. It does not enqueue work or collect secrets.
import { safeString } from './projection.mjs';

const ROLE_NAMES = Object.freeze({
  maya: 'Project Manager', leo: 'Team Lead', dani: 'Senior Developer',
  noah: 'Developer', aria: 'Creative Designer', erin: 'QA Engineer',
  kai: 'DevOps Engineer', avery: 'Business Analyst',
  sophie: 'Content Writer', milo: 'Social Media Specialist'
});

const ACTIVE_STATES = new Set(['running', 'executing', 'in_progress']);
const KNOWN_STATES = new Set(['queued','claimed','ready','pending','running','executing','in_progress','reviewing','testing','deploying','blocked','failed','succeeded','cancelled','canceled','waiting_approval','awaiting_approval']);

export function mapJujuState(value) {
  const state = String(value || '').toLowerCase();
  if (!KNOWN_STATES.has(state)) return 'unknown';
  return ({ executing:'running',in_progress:'running',claimed:'queued',ready:'queued',pending:'queued',canceled:'cancelled',waiting_approval:'awaiting_approval' })[state] || state;
}

function clearRole(job) {
  const stage = String(job.stage || '').toLowerCase().replace(/[_-]/g,' ');
  const task = String(job.title || '').toLowerCase();
  // Stage semantics are authoritative. Titles are only used to disambiguate
  // categories that would otherwise be too generic to represent as a role.
  if (/\b(social|campaign|publishing|media planning)\b/.test(stage)) return 'milo';
  if (/\b(editorial|content writing|copywriting|documentation)\b/.test(stage)) return 'sophie';
  if (/\b(design|creative|artwork|illustration)\b/.test(stage)) return 'aria';
  if (/\b(qa|testing|test execution|browser verification|regression)\b/.test(stage)) return 'erin';
  if (/\b(deploy|deployment|release|infrastructure|devops)\b/.test(stage)) return 'kai';
  if (/\b(planning|intake|requirements|sprint planning)\b/.test(stage)) return 'maya';
  if (/\b(architecture|code review|pr review|technical review)\b/.test(stage)) return 'leo';
  if (/\b(research|investigation|analysis|discovery)\b/.test(stage)) return 'avery';
  if (/\b(coding|implementation|development|debugging|code change)\b/.test(stage)) {
    // Explicit editorial/design/QA work on a generic implementation stage
    // should not be represented as someone coding.
    if (/\b(copy|article|editorial|documentation|social|campaign|design|creative|qa|test)\b/.test(task)) return null;
    return 'dani';
  }
  // Generic stages ("execution", "verification", "queued", etc.) prove a
  // job exists, but do not prove which virtual employee should be animating.
  return null;
}

function validJob(value) {
  return value && typeof value === 'object' && typeof value.id === 'string'
    && typeof value.title === 'string' && typeof value.project === 'string';
}

export function projectJujuJobs(response, now = Date.now()) {
  if (!response || !Array.isArray(response.items)) throw new Error('Unrecognized JUJU jobs response');
  const jobs = response.items.filter(validJob).slice(0, 100);
  const seenProjects = new Map();
  const liveRoles = new Map();
  const activity = [];

  for (const job of jobs) {
    const projectID = safeString(job.project_id || job.project, 60);
    if (!projectID) continue;
    if (!seenProjects.has(projectID)) seenProjects.set(projectID, {
      id: projectID, name: safeString(job.project, 70), subtitle:'Authorized JUJU project',
      icon: safeString(job.project,1).toUpperCase(), color: seenProjects.size % 2 ? 'teal':'violet',
      progress: null, state:'unknown'
    });
    const project = seenProjects.get(projectID);
    const mapped = mapJujuState(job.state);
    const updatedAt = Date.parse(job.updated_at);
    const age = Number.isFinite(updatedAt) ? now - updatedAt : Number.POSITIVE_INFINITY;
    const stale = age > 120_000 || age < -30_000;
    if (mapped === 'running') {
      if (!stale) project.state = 'running';
      else if (project.state !== 'running') project.state = 'stale';
    }
    const representative = clearRole(job);
    if (representative && !liveRoles.has(representative) && (ACTIVE_STATES.has(String(job.state).toLowerCase()) || ['reviewing','testing','deploying','planning','investigating'].includes(mapped))) {
      const personState = stale ? 'stale' : mapped;
      const existing = ROLE_NAMES[representative];
      const evidence = typeof job.pull_request_url === 'string' && /^https:\/\/github\.com\//i.test(job.pull_request_url) ? job.pull_request_url : null;
      const pipeline = /\b(deploy|release)\b/i.test(job.stage) ? 3 : /\b(qa|test)\b/i.test(job.stage) ? 2 : /\b(review)\b/i.test(job.stage) ? 1 : 0;
      liveRoles.set(representative, {
        id: representative, name: `Virtual ${existing}`, role: existing,
        project_id: projectID, state:personState,
        task: stale ? 'Job update too old to confirm current work' : safeString(job.title,180),
        bubble: stale ? 'Awaiting updates' : safeString(job.stage || 'Active task',50),
        job_id: safeString(job.job_key || job.id,100),
        stage: safeString(job.stage,70), pipeline, evidence_url: evidence
      });
    }
    if (activity.length < 25) activity.push({
      id: safeString(job.id,80),project_id:projectID,
      message: safeString(`${job.title} · ${mapped === 'unknown' ? 'Unknown state' : mapped}`,200),
      status:mapped,when:Number.isFinite(age) && age >= 0 ? relativeAge(age) : 'Update time unknown'
    });
  }
  return {
    schema_version:'1.0',mode:'live',observed_at:new Date(now).toISOString(),
    projects:Array.from(seenProjects.values()),staff:Array.from(liveRoles.values()),activity
  };
}

function relativeAge(milliseconds) {
  const minutes = Math.floor(milliseconds/60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes/60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours/24)} d ago`;
}

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
const KNOWN_STATES = new Set(['queued','claimed','ready','pending','running','executing','in_progress','planning','investigating','reviewing','testing','deploying','blocked','failed','succeeded','cancelled','canceled','waiting_approval','awaiting_approval']);

// The public portfolio preview starts in explicit DEMO mode. Only the
// operator's existing JUJU origin is eligible for automatic LIVE attachment.
export function shouldAutoConnectLive(hostname, pathname) {
  return hostname === 'auto.juju-mini.local' && pathname.startsWith('/office/');
}

export function authFailure(status) {
  return status === 401 ? 'JUJU sign-in required' : status === 403 ? 'JUJU jobs.view permission required' : null;
}

export function mapJujuState(value) {
  const state = String(value || '').toLowerCase();
  if (!KNOWN_STATES.has(state)) return 'unknown';
  return ({ executing:'running',in_progress:'running',claimed:'queued',ready:'queued',pending:'queued',canceled:'cancelled',waiting_approval:'awaiting_approval' })[state] || state;
}

function clearRole(job) {
  const stage = String(job.stage || '').toLowerCase().replace(/[_-]/g,' ');
  const task = String(job.title || '').toLowerCase();
  // Prefer an explicit execution stage. A generic stage is not proof that a
  // virtual employee is working, but some job titles state the action clearly
  // enough to identify a role. Never infer a role from broad words such as
  // "content", "campaign", "fix" or "design" on their own.
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
  if (!/^(execution|executing|running|active|in progress|working|)$/i.test(stage)) return null;
  // Explicit verb-object phrases can disambiguate generic execution. The
  // operator still sees the exact source title in the worker inspector.
  if (/\b(?:run(?:ning)?|execute|executing)\s+(?:qa|regression|unit|integration|e2e|browser)\s+tests?\b|\b(?:qa|regression)\s+(?:pass|testing|verification)\b/.test(task)) return 'erin';
  if (/\b(?:deploy(?:ing)?|roll(?:ing)?\s*out|publish(?:ing)?)\s+(?:a\s+|the\s+)?(?:release|staging|production|service|container)\b|\b(?:configure|provision)\s+(?:a\s+|the\s+)?(?:server|proxy|pipeline|infrastructure)\b/.test(task)) return 'kai';
  if (/\b(?:review(?:ing)?|approve|approving)\s+(?:a\s+|the\s+)?(?:pull request|pr\b|code changes?|architecture)\b/.test(task)) return 'leo';
  if (/\b(?:write|writing|draft|drafting|edit|editing)\s+(?:the\s+|a\s+)?(?:release notes|documentation|article|blog post|copy)\b/.test(task)) return 'sophie';
  if (/\b(?:schedule|scheduling|publish|publishing)\s+(?:a\s+|the\s+)?(?:social posts?|social media posts?|campaign posts?)\b/.test(task)) return 'milo';
  if (/\b(?:create|creating|draw|drawing|illustrate|illustrating)\s+(?:a\s+|the\s+)?(?:ui mockup|wireframe|illustrations?|design assets?)\b/.test(task)) return 'aria';
  if (/\b(?:plan|planning)\s+(?:a\s+|the\s+)?(?:sprint|roadmap|project kickoff)\b/.test(task)) return 'maya';
  if (/\b(?:analy[sz]e|analy[sz]ing|research|researching)\s+(?:a\s+|the\s+)?(?:requirements?|user needs|market|accessibility)\b/.test(task)) return 'avery';
  if (/\b(?:debug|debugging|refactor|refactoring)\b|\b(?:fix|fixing|resolve|resolving)\s+(?:a\s+|the\s+)?(?:[^\n]{0,42}\s)?(?:bug|crash|error|regression)\b|\b(?:implement|implementing|code|coding)\s+(?:a\s+|the\s+)?(?:api|endpoint|feature|component|function)\b/.test(task)) return 'dani';
  // An ambiguous title or an unknown stage stays unassigned.
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
      progress: null, state:'unknown', _running:0, _queued:0, _blocked:0
    });
    const project = seenProjects.get(projectID);
    const mapped = mapJujuState(job.state);
    const updatedAt = Date.parse(job.updated_at);
    const age = Number.isFinite(updatedAt) ? now - updatedAt : Number.POSITIVE_INFINITY;
    const stale = age > 120_000 || age < -30_000;
    if (mapped === 'running') project._running++;
    if (['queued','awaiting_approval'].includes(mapped)) project._queued++;
    if (['blocked','failed'].includes(mapped)) project._blocked++;
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
  // Backlog records are real JUJU work, but a queued, blocked or stale job
  // must never animate an employee as if execution were in progress.
  for (const project of seenProjects.values()) {
    const parts = [];
    if (project._running) parts.push(`${project._running} running`);
    if (project._queued) parts.push(`${project._queued} waiting`);
    if (project._blocked) parts.push(`${project._blocked} blocked/failed`);
    project.subtitle = safeString(parts.join(' · ') || 'No current tasks in recent JUJU jobs',100);
    if (project.state === 'unknown' && project._queued) project.state='queued';
    delete project._running;
    delete project._queued;
    delete project._blocked;
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

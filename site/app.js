import { demoSnapshot } from './data.mjs';
import { escapeHTML as h, isActive, normalizedState, sanitizeSnapshot, stateText } from './projection.mjs';

// JUJU Office is a read-only projection, never a second task scheduler.
// In DEMO mode only synthetic data is used. LIVE requires a separately
// authenticated, same-origin private adapter at /api/office/v1/snapshot.
const $ = id => document.getElementById(id);
const state = {
  mode: 'demo', connection: 'demo', snapshot: demoSnapshot,
  selected: 'dani', project: null, view: 'office', zoom: .92,
  lastLiveError: '', liveTimer: null, lastSuccess: 0
};
const positions = new Map(demoSnapshot.staff.map(p => [p.id, p]));
const PIPES = ['Coding', 'Review', 'QA', 'Deploy'];
// Resolve from the page location so optional /office/ hosting does not send
// authenticated adapter calls to the Control Center's legacy root routes.
const LIVE_URL = new URL('./api/office/v1/snapshot', document.baseURI).pathname;

function projectById(id) { return state.snapshot.projects.find(p => p.id === id); }
function roleRoster() {
  if (state.mode === 'demo') return state.snapshot.staff;
  const staff = new Map(state.snapshot.staff.map(s => [s.id, s]));
  return demoSnapshot.staff.map(base => {
    const actual = staff.get(base.id);
    return actual ? { ...base, ...actual, sprite: base.sprite, x: base.x, y: base.y, role: base.role, department: base.department } : {
      ...base, name: `Virtual ${base.role}`, state: state.connection === 'connected' ? 'idle' : 'disconnected',
      task: 'No verified active task', bubble: '', project_id: null, job_id: '', stage: '', pipeline: 0
    };
  });
}
function selectedPerson() { return roleRoster().find(s => s.id === state.selected) ?? roleRoster()[0]; }
function glyph(sprite) { return `${(sprite % 5) * 25}% ${Math.floor(sprite / 5) * 100}%`; }
function personClass(person) { return isActive(person.state) ? 'active-work' : ''; }
function statusClass(value) {
  if (['succeeded'].includes(value)) return 'positive';
  if (['blocked', 'failed', 'disconnected'].includes(value)) return 'danger';
  if (['stale', 'awaiting_approval', 'queued'].includes(value)) return 'warning';
  if (['idle', 'unknown', 'cancelled'].includes(value)) return 'muted';
  return '';
}
function renderMode() {
  const badge = $('mode-badge');
  badge.className = `mode-badge ${state.mode === 'live' ? (state.connection === 'connected' ? 'live' : 'disconnected') : ''}`;
  badge.innerHTML = `<span class="status-light"></span> ${state.mode === 'demo' ? 'DEMO' : state.connection === 'connected' ? 'LIVE' : 'OFFLINE'}`;
  $('mode-toggle-label').textContent = state.mode === 'demo' ? 'Connect live' : 'Return to demo';
  $('scene-caption').textContent = state.mode === 'demo' ? '10 virtual roles · synthetic sample' : state.connection === 'connected' ? 'Verified JUJU work · read-only' : 'Awaiting verified JUJU data';
}
function renderProjects() {
  $('project-count').textContent = `(${state.snapshot.projects.length})`;
  const cards = state.snapshot.projects.map(p => {
    const color = p.color === 'teal' ? 'teal' : 'violet';
    const progress = Number.isFinite(p.progress) ? p.progress : null;
    return `<button class="project-card ${color} ${state.project === p.id ? 'selected' : ''}" data-project="${h(p.id)}" aria-pressed="${state.project === p.id}">
      <div class="project-name-line"><span class="project-icon">${h(p.icon || p.name.charAt(0))}</span>${h(p.name)}</div>
      <span class="project-sub">${h(p.subtitle)}</span><div class="project-status"><i></i>${state.mode === 'demo' ? 'Demo project' : h(stateText(p.state))}</div>
      <div class="progress-line"><span class="progress-track"><span class="progress-fill" style="width:${progress ?? 0}%"></span></span><b>${progress === null ? '—' : `${Math.round(progress)}%`}</b></div>
    </button>`;
  }).join('');
  $('project-cards').innerHTML = cards || `<p style="color:#b1c8e8;padding:0 12px">No authorized projects returned.</p>`;
}
function renderPeople() {
  const actors = roleRoster();
  $('people-layer').innerHTML = actors.map((p, i) => {
    const dimmed = state.project && p.project_id !== state.project;
    const seated = ['dani', 'noah'].includes(p.id) && isActive(p.state);
    const artPosition = seated ? `${p.id === 'dani' ? 0 : 100}% 0%` : glyph(p.sprite);
    const bubble = (p.bubble && isActive(p.state)) ? `<span class="speech">${h(p.bubble)}</span>` : '';
    return `<button type="button" class="person ${personClass(p)} ${seated ? 'sitting' : ''} ${state.selected === p.id ? 'selected bubble-highlight' : ''} ${!dimmed && [2,5,6,8].includes(i) ? 'bubble-highlight' : ''} ${dimmed ? 'dimmed' : ''}" data-person="${h(p.id)}"
      style="left:${p.x}%;top:${p.y}%;--delay:-${(i % 5) * .41}s" aria-label="${h(p.role)}: ${h(p.task || stateText(p.state))}" aria-pressed="${state.selected === p.id}">
      <span class="ground-ring"></span><span class="character" style="background-position:${artPosition}"></span>${bubble}<span class="person-label">${h(p.role)}</span>
    </button>`;
  }).join('');
}
function renderInspector() {
  const p = selectedPerson();
  if (!p) { $('inspector-content').innerHTML = '<p>No team members available.</p>'; return; }
  const proj = projectById(p.project_id);
  const index = Number.isInteger(p.pipeline) ? p.pipeline : 0;
  const source = p.evidence_url ? `<a class="source-link" href="${h(p.evidence_url)}" target="_blank" rel="noopener noreferrer">View verified source <span class="out">↗</span></a>` : `<span class="source-link">${h(p.job_id || 'No job linked')} <span class="out" aria-hidden="true">↗</span></span>`;
  $('inspector-content').innerHTML = `<div class="inspector-card">
    <div class="inspector-heading">Selected Team Member</div><div class="inspector-rule" style="margin:10px 0 17px"></div>
    <div class="person-profile"><div class="profile-avatar"><span class="character" style="background-position:${glyph(p.sprite)}"></span></div>
      <div class="profile-intro"><h2 class="profile-name">${h(p.name)}</h2><div class="profile-role">${h(p.role)}</div><div class="profile-online"><i></i>${state.mode === 'demo' ? 'Demo avatar' : h(stateText(p.state))}</div></div></div>
    <div class="inspector-rule"></div>
    <div class="detail-section"><div class="detail-label"><span class="detail-icon">▤</span> Task</div><div class="detail-value">${h(p.task || 'No verified task')}</div><div class="detail-sub">${h(p.department)} ${p.stage ? `· ${h(p.stage)}` : ''}</div></div>
    <div class="inspector-rule"></div>
    <div class="detail-section"><div class="detail-label"><span class="detail-icon">⌁</span> State</div><span class="pill ${statusClass(p.state)}">◉ ${h(stateText(p.state))}</span></div>
    <div class="inspector-rule"></div>
    <div class="detail-section"><div class="detail-label"><span class="detail-icon">◉</span> Source</div>${source}</div>
    <div class="inspector-rule"></div>
    <div class="detail-section"><div class="detail-label"><span class="detail-icon">♧</span> Pipeline</div><div class="pipeline-steps">${PIPES.map((step,i) => `<div class="pipeline-step ${index > i ? 'passed' : index === i && isActive(p.state) ? 'current' : ''}"><span class="pipeline-dot">${index > i ? '✓' : ''}</span><span>${step}</span></div>`).join('')}</div></div>
    <div class="inspector-rule"></div>
    <div class="detail-section"><div class="detail-label"><span class="detail-icon">▱</span> Project</div><div class="project-inline">${proj ? `<span class="project-icon" style="background:${proj.color === 'teal' ? '#15bda5' : '#9350df'}">${h(proj.icon || proj.name[0])}</span>${h(proj.name)}` : '<span>No assigned project</span>'}</div></div>
    <div class="inspector-footnote">${state.mode === 'demo' ? 'Portfolio demonstration: all names, jobs, task descriptions, progress and activity are synthetic.' : state.connection !== 'connected' ? 'Disconnected. This panel does not represent current live activity.' : 'Live read-only projection. Each role is a visual representative, not a literal human employee. Only authorized evidence should be shown.'}</div>
  </div>`;
}
function renderActivity() {
  const entries = state.snapshot.activity.filter(a => !state.project || a.project_id === state.project).slice(0,3);
  $('activity-items').innerHTML = entries.map(item => {
    const proj = projectById(item.project_id);
    return `<div class="activity-item"><span class="project-icon" style="${proj?.color === 'teal' ? 'background:#16b7a7' : ''}">${h(proj?.icon || '•')}</span><span class="activity-icon">${item.status === 'succeeded' ? '✓' : '◌'}</span><div class="activity-text"><div><strong>${h(proj?.name || 'JUJU')}</strong> · ${h(item.message)}</div><small>${h(item.when || 'Time not available')}</small></div></div>`;
  }).join('') || `<div class="activity-item"><div class="activity-text"><div>No verified activity available</div><small>${state.mode === 'demo' ? 'Demo has no activity in this filter' : 'Awaiting JUJU events'}</small></div></div>`;
}
function viewTitle() { return ({ office:'The studio floor', tasks:'Tasks & assignments', automation:'Automation', projects:'Project portfolio', reports:'Office reports' })[state.view]; }
function renderView() {
  $('scene-title').textContent = viewTitle();
  for (const btn of document.querySelectorAll('.nav-link')) btn.classList.toggle('active', btn.dataset.view === state.view);
  const panel = $('view-panel');
  if (state.view === 'office') { panel.hidden = true; return; }
  panel.hidden = false;
  const roster = roleRoster().filter(p => !state.project || p.project_id === state.project);
  const projects = state.snapshot.projects.filter(p => !state.project || p.id === state.project);
  const intro = `<div class="panel-top"><h2>${h(viewTitle())}</h2><button data-close-panel>Return to floor ✕</button></div>`;
  const demo = state.mode === 'demo' ? '<div class="note-box">DEMO DATA — This view uses a fictional portfolio scenario; it does not represent live JUJU execution.</div>' : '';
  if (state.view === 'tasks') {
    panel.innerHTML = `${intro}<p class="panel-description">Select an assignment to locate its virtual specialist on the office floor.</p>${demo}<div class="panel-grid">${roster.map(p => `<div class="panel-tile"><div class="mini-heading"><strong>${h(p.role)}</strong><small>${h(stateText(p.state))}</small></div><p>${h(p.task || 'No verified task')}</p><div class="tile-foot">${h(projectById(p.project_id)?.name || 'Unassigned')} · ${h(p.job_id || 'No job')}</div><p><button data-locate="${h(p.id)}">Find ${h(p.role)} on floor ↗</button></p></div>`).join('') || '<p>No authorized assignments.</p>'}</div>`;
  } else if (state.view === 'projects') {
    panel.innerHTML = `${intro}<p class="panel-description">Projects are the source of context; JUJU remains the source of truth for real work.</p>${demo}<div class="panel-grid">${projects.map(p => `<div class="panel-tile"><div class="mini-heading"><strong>${h(p.name)}</strong><small>${p.progress === null ? 'Unreported' : `${p.progress}%`}</small></div><p>${h(p.subtitle)}</p><div class="progress-track"><span class="progress-fill" style="width:${p.progress ?? 0}%"></span></div><p><button data-project-panel="${h(p.id)}">See people and tasks</button></p></div>`).join('') || '<p>No projects in this filter.</p>'}</div>`;
  } else if (state.view === 'automation') {
    panel.innerHTML = `${intro}<p class="panel-description">The office observes the existing JUJU workflow. It does not queue, approve or deploy jobs.</p>${demo}<div class="stats-grid"><div class="stat-box"><b>${roster.filter(p => isActive(p.state)).length}</b><span>Roles displaying verified activity${state.mode === 'demo' ? ' (synthetic)' : ''}</span></div><div class="stat-box"><b>${roster.filter(p => p.state === 'blocked').length}</b><span>Blocked projections</span></div><div class="stat-box"><b>${roster.length}</b><span>Visible roles</span></div></div><div class="note-box">Flow: JUJU job → existing Control Center → authorized read-only adapter → this animated office. No second scheduler, queue, token storage or direct deployment control.</div>`;
  } else {
    panel.innerHTML = `${intro}<p class="panel-description">A read-only view of the current snapshot, with no invented performance metrics.</p>${demo}<div class="stats-grid"><div class="stat-box"><b>${projects.length}</b><span>Visible projects</span></div><div class="stat-box"><b>${roster.filter(p => isActive(p.state)).length}</b><span>Roles with activity</span></div><div class="stat-box"><b>${state.snapshot.activity.filter(a => !state.project || a.project_id === state.project).length}</b><span>Recent activity items</span></div></div><div class="panel-grid">${roster.map(p => `<div class="panel-tile"><div class="mini-heading"><strong>${h(p.department)}</strong><small>${h(stateText(p.state))}</small></div><p>${h(p.role)} — ${h(p.task || 'No verified task')}</p></div>`).join('')}</div>`;
  }
}
function renderAll() { renderMode(); renderProjects(); renderPeople(); renderInspector(); renderActivity(); renderView(); }
function locateWorker(id) {
  state.selected = id; state.view = 'office'; state.project = null; renderAll();
  const actor = roleRoster().find(p => p.id === id);
  if (actor) {
    const world = $('floor-world'), viewport = $('floor-viewport');
    const left = world.offsetWidth * actor.x / 100 - viewport.clientWidth / 2;
    const top = world.offsetHeight * actor.y / 100 - viewport.clientHeight / 2;
    viewport.scrollTo({ left, top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}
function setView(view) { state.view = view; renderView(); }
function setZoom(value) {
  state.zoom = Math.max(.65,Math.min(1.35,Math.round(value * 100) / 100));
  $('floor-world').style.width = `${Math.round(1672 * state.zoom)}px`;
  $('zoom-readout').textContent = `${Math.round(state.zoom * 100)}%`;
}
function toast(message) { const el = $('toast'); el.textContent = message; el.hidden = false; clearTimeout(toast.timeout); toast.timeout = setTimeout(() => el.hidden = true, 4500); }
function modal(title, body) { $('modal-title').textContent = title; $('modal-body').innerHTML = body; $('modal-backdrop').hidden = false; $('modal-close').focus(); }
function closeModal() { $('modal-backdrop').hidden = true; }
function initialCenter() { const e = $('floor-viewport'); e.scrollLeft = Math.max(0,($('floor-world').offsetWidth - e.clientWidth)/2 - 35); e.scrollTop = Math.max(0,($('floor-world').offsetHeight-e.clientHeight)/2); }

async function refreshLive() {
  if (state.mode !== 'live' || document.hidden) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(LIVE_URL, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snapshot = sanitizeSnapshot(await res.json());
    if (state.mode !== 'live') return;
    state.snapshot = snapshot; state.lastSuccess = Date.now(); state.lastLiveError = '';
    state.connection = snapshot.stale ? 'stale' : 'connected'; renderAll();
  } catch (error) {
    if (state.mode !== 'live') return;
    state.connection = 'disconnected'; state.lastLiveError = String(error?.message || error).slice(0,100);
    state.snapshot = { schema_version:'1.0', mode:'live', observed_at:null, projects:[], staff:[], activity:[] };
    renderAll();
  } finally { clearTimeout(timeout); }
}
function toggleMode() {
  if (state.mode === 'demo') {
    state.mode = 'live'; state.connection = 'disconnected';
    state.snapshot = { schema_version:'1.0', mode:'live', observed_at:null, projects:[], staff:[], activity:[] };
    renderAll(); refreshLive(); state.liveTimer = setInterval(refreshLive,12000);
    toast('Connecting to the JUJU read-only office adapter. No simulated tasks appear in LIVE mode.');
  } else {
    clearInterval(state.liveTimer); state.mode = 'demo'; state.connection = 'demo'; state.snapshot = demoSnapshot;
    state.project = null; renderAll(); toast('Returned to explicitly labelled synthetic demo.');
  }
}

document.addEventListener('click',event => {
  const person = event.target.closest('[data-person]');
  const project = event.target.closest('[data-project]');
  const panelProject = event.target.closest('[data-project-panel]');
  const locate = event.target.closest('[data-locate]');
  const nav = event.target.closest('[data-view]');
  if (person) { state.selected = person.dataset.person; renderPeople(); renderInspector(); return; }
  if (project) { state.project = state.project === project.dataset.project ? null : project.dataset.project; renderAll(); return; }
  if (panelProject) { state.project = panelProject.dataset.projectPanel; state.view = 'tasks'; renderAll(); return; }
  if (locate) { locateWorker(locate.dataset.locate); return; }
  if (nav) { setView(nav.dataset.view); return; }
  if (event.target.closest('[data-close-panel]')) { setView('office'); return; }
});
$('all-projects').addEventListener('click',() => {state.project = null;state.view='projects';renderAll();});
$('mode-toggle').addEventListener('click',toggleMode);
$('zoom-in').addEventListener('click',() => setZoom(state.zoom+.1));
$('zoom-out').addEventListener('click',() => setZoom(state.zoom-.1));
$('scene-reset').addEventListener('click',() => {setZoom(.92);initialCenter();});
$('feed-more').addEventListener('click',() => {
  modal('Activity feed', `<p>${state.mode === 'demo' ? 'All events below are synthetic portfolio examples.' : 'Authorized JUJU events only.'}</p><div class="search-results">${state.snapshot.activity.map(a => `<div class="search-result">${h(projectById(a.project_id)?.name || 'JUJU')} · ${h(a.message)}<small>${h(a.when)}</small></div>`).join('') || '<p>No events available.</p>'}</div>`);
});
$('notifications-trigger').addEventListener('click',() => $('feed-more').click());
$('help-trigger').addEventListener('click',() => modal('About JUJU Office', `<p>This is a living 2.5D visual layer for the existing JUJU automation workflow. Select a character to see their associated task, state, source and stage.</p><p><strong>DEMO</strong> is a completely synthetic, fictional showcase. <strong>LIVE</strong> only shows data from a configured, authenticated same-origin JUJU adapter. If unavailable, the office displays OFFLINE instead of pretending to work.</p><p>The avatars represent virtual roles, not a workforce of human employees. This first visual slice is a work in progress; its character animation and scene depth will be refined further.</p>`));
$('search-trigger').addEventListener('click',() => {
  modal('Search team & tasks', '<input class="search-input" id="search-input" type="search" placeholder="Search a role, name or assignment" aria-label="Search team and tasks"/><div class="search-results" id="search-results"></div>');
  const input = $('search-input'), results = $('search-results');
  function update() { const term=input.value.trim().toLowerCase();const matches=roleRoster().filter(p => [p.role,p.name,p.task,p.department].some(value => String(value||'').toLowerCase().includes(term)));results.innerHTML=matches.map(p=>`<button class="search-result" data-search-person="${h(p.id)}"><strong>${h(p.name)}</strong> · ${h(p.role)}<small>${h(p.task || stateText(p.state))}</small></button>`).join('') || '<p>No matches in this snapshot.</p>'; }
  input.addEventListener('input',update);results.addEventListener('click',event => {const item=event.target.closest('[data-search-person]');if(item){closeModal();locateWorker(item.dataset.searchPerson);}});
  update(); input.focus();
});
$('modal-close').addEventListener('click',closeModal);
$('modal-backdrop').addEventListener('click',event => {if(event.target === $('modal-backdrop'))closeModal();});
document.addEventListener('keydown',event => {if(event.key === 'Escape')closeModal();});
const viewport = $('floor-viewport'); let drag = null;
viewport.addEventListener('pointerdown',event => {if (event.button !== 0 || event.target.closest('button'))return;drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.classList.add('dragging');viewport.setPointerCapture(event.pointerId);});
viewport.addEventListener('pointermove',event => {if(!drag)return;viewport.scrollLeft=drag.left-(event.clientX-drag.x);viewport.scrollTop=drag.top-(event.clientY-drag.y);});
function endDrag(){drag=null;viewport.classList.remove('dragging');}
viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
document.addEventListener('visibilitychange',() => {if(!document.hidden && state.mode==='live')refreshLive();});
renderAll(); setZoom(state.zoom); requestAnimationFrame(initialCenter);

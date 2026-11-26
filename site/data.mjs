// Public, deliberately synthetic portfolio sample. Never substitute these events for JUJU jobs.
export const demoSnapshot = {
  schema_version: '1.0',
  mode: 'demo',
  observed_at: '2026-11-24T18:00:00Z',
  projects: [
    { id: 'atlas', name: 'STUDIO ATLAS', subtitle: 'Research workflow platform', icon: 'A', color: 'violet', progress: 72, state: 'in_progress' },
    { id: 'northstar', name: 'NORTHSTAR HOME', subtitle: 'Connected home accessibility', icon: '⌂', color: 'teal', progress: 58, state: 'in_progress' }
  ],
  staff: [
    { id: 'maya', name: 'Maya Santos', role: 'Project Manager', department: 'Planning', sprite: 0, x: 29, y: 48, project_id: 'atlas', state: 'idle', task: 'No task assigned — between meetings', bubble: '', job_id: '', stage: '', pipeline: 0 },
    { id: 'leo', name: 'Leo Chen', role: 'Team Lead', department: 'Planning', sprite: 1, x: 40, y: 48, project_id: 'atlas', state: 'idle', task: 'No task assigned — office break', bubble: '', job_id: '', stage: '', pipeline: 0 },
    { id: 'dani', name: 'Dani Arreza', role: 'Senior Developer', department: 'Development', sprite: 2, x: 48, y: 78, project_id: 'atlas', state: 'running', task: 'Fix report loading', bubble: 'Fixing bug', job_id: 'DEMO-4106', stage: 'Coding', pipeline: 0 },
    { id: 'noah', name: 'Noah Brooks', role: 'Developer', department: 'Development', sprite: 3, x: 61, y: 77, project_id: 'northstar', state: 'running', task: 'Add device status API', bubble: 'Writing code', job_id: 'DEMO-4108', stage: 'Coding', pipeline: 0 },
    { id: 'aria', name: 'Aria Moreno', role: 'Creative Designer', department: 'Creative', sprite: 4, x: 24, y: 74, project_id: 'atlas', state: 'running', task: 'Refine dashboard illustrations', bubble: 'Designing UI', job_id: 'DEMO-4099', stage: 'Design', pipeline: 0 },
    { id: 'erin', name: 'Erin Walsh', role: 'QA Engineer', department: 'QA Lab', sprite: 5, x: 78, y: 63, project_id: 'atlas', state: 'testing', task: 'Run report regression tests', bubble: 'Running QA', job_id: 'DEMO-4107', stage: 'QA', pipeline: 2 },
    { id: 'kai', name: 'Kai Morgan', role: 'DevOps Engineer', department: 'DevOps', sprite: 6, x: 62, y: 39, project_id: 'northstar', state: 'deploying', task: 'Validate staging deployment', bubble: 'Staging deploy', job_id: 'DEMO-4088', stage: 'Deploy', pipeline: 3 },
    { id: 'avery', name: 'Avery Kim', role: 'Business Analyst', department: 'Planning', sprite: 7, x: 38, y: 63, project_id: 'northstar', state: 'idle', task: 'No task assigned — break', bubble: '', job_id: '', stage: '', pipeline: 0 },
    { id: 'sophie', name: 'Sophie Bennett', role: 'Content Writer', department: 'Content & Social', sprite: 8, x: 85, y: 36, project_id: 'atlas', state: 'running', task: 'Draft release notes', bubble: 'Writing copy', job_id: 'DEMO-4110', stage: 'Editorial', pipeline: 0 },
    { id: 'milo', name: 'Milo Rivera', role: 'Social Media Specialist', department: 'Content & Social', sprite: 9, x: 93, y: 37, project_id: 'northstar', state: 'idle', task: 'No task assigned — social break', bubble: '', job_id: '', stage: '', pipeline: 0 }
  ],
  activity: [
    { id: 'a1', project_id: 'atlas', message: 'PR #4105 merged', status: 'succeeded', when: '2 min ago' },
    { id: 'a2', project_id: 'northstar', message: 'Staging deploy succeeded', status: 'succeeded', when: '6 min ago' },
    { id: 'a3', project_id: 'atlas', message: 'QA passed (98% tests)', status: 'succeeded', when: '9 min ago' },
    { id: 'a4', project_id: 'atlas', message: 'Editorial draft queued for review', status: 'reviewing', when: '12 min ago' }
  ]
};

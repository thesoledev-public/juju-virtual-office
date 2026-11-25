import test from 'node:test';
import assert from 'node:assert/strict';
import {mapJujuState,projectJujuJobs,shouldAutoConnectLive} from './juju-live.mjs';

const NOW=Date.parse('2026-11-25T10:00:00Z');
const job={id:'job-1',job_key:'task-1',title:'Fix report loading',project:'ATLAS',project_id:'atlas',state:'running',stage:'coding',updated_at:'2026-11-25T09:59:50Z'};

test('a verified coding stage makes exactly one developer active',()=>{
 const p=projectJujuJobs({items:[job]},NOW);
 assert.equal(p.mode,'live');assert.equal(p.projects.length,1);assert.equal(p.projects[0].progress,null);
 assert.equal(p.staff.length,1);assert.equal(p.staff[0].id,'dani');assert.equal(p.staff[0].state,'running');
});
test('generic execution stage cannot imply coding or another virtual worker',()=>{
 const p=projectJujuJobs({items:[{...job,stage:'execution'}]},NOW);
 assert.equal(p.staff.length,0);assert.equal(p.activity.length,1);
});
test('stale active jobs do not continue looking like active coding',()=>{
 const p=projectJujuJobs({items:[{...job,updated_at:'2026-11-25T09:30:00Z'}]},NOW);
 assert.equal(p.staff[0].state,'stale');assert.match(p.staff[0].task,/too old/);
});
test('projects do not get invented completion percentages or additional role activity',()=>{
 const p=projectJujuJobs({items:[job,{...job,id:'job-2',job_key:'task-2',stage:'planning',title:'Plan sprint'}]},NOW);
 assert.equal(p.staff.length,2);assert.deepEqual(p.staff.map(s=>s.id),['dani','maya']);
 assert.equal(p.projects[0].progress,null);
});
test('unrecognized state and malformed records fail closed',()=>{
 assert.equal(mapJujuState('hmm'),'unknown');
 assert.throws(()=>projectJujuJobs({items:'not a list'},NOW),/Unrecognized/);
 assert.equal(projectJujuJobs({items:[{id:42,title:'X'}]},NOW).staff.length,0);
});
test('title alone never assigns a social/creative/coding role',()=>{
 const p=projectJujuJobs({items:[{...job,stage:'execution',title:'Post campaign content'}]},NOW);
 assert.equal(p.staff.length,0);
});
test('production office auto-connects while the portfolio and other hosts remain demo',()=>{
 assert.equal(shouldAutoConnectLive('auto.juju-mini.local','/office/'),true);
 assert.equal(shouldAutoConnectLive('auto.juju-mini.local','/office/tasks'),true);
 assert.equal(shouldAutoConnectLive('auto.juju-mini.local','/'),false);
 assert.equal(shouldAutoConnectLive('example.org','/office/'),false);
 assert.equal(shouldAutoConnectLive('evil-auto.juju-mini.local','/office/'),false);
});

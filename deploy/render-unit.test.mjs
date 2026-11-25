import test from 'node:test';
import assert from 'node:assert/strict';
import {renderUnit} from './render-unit.mjs';
const NODE='/srv/juju-work/juju-office-runtime/node-v24.13.0';

test('preview service binds only to the NPM bridge and is resource-capped',()=>{
 const s=renderUnit('172.18.0.1',NODE);
 assert.match(s,/Environment=HOST=172\.18\.0\.1/);
 assert.match(s,/MemoryMax=128M/);
 assert.match(s,/CPUQuota=12%/);
 assert.match(s,/PUBLIC_BASE_PATH=\/office/);
 assert.match(s,/ExecStart=\/srv\/juju-work\/juju-office-runtime\/node-v24\.13\.0 /);
 assert.match(s,/ProtectHome=true/);
 assert.doesNotMatch(s,/__NPM_BRIDGE_GATEWAY__/);
 assert.doesNotMatch(s,/__OFFICE_NODE_EXECUTABLE__/);
});
test('unsafe gateway input is rejected before writing any unit',()=>{
 for(const v of ['0.0.0.999','0.0.0.0','127.0.0.1','127.0.0.1\nExecStart=/bin/sh','host.docker.internal','']) assert.throws(()=>renderUnit(v,NODE));
});
test('runtime path must be dedicated and cannot bypass protected home',()=>{
 for(const v of ['/home/juju/.nvm/node','/usr/bin/env','/srv/juju-work/../node','/srv/juju-work/juju-office-runtime/node-v24.13.0\nUser=root']) {
  assert.throws(()=>renderUnit('172.18.0.1',v));
 }
});

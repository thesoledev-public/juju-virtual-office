import test from 'node:test';
import assert from 'node:assert/strict';
import {renderUnit} from './render-unit.mjs';

test('preview service binds only to the NPM bridge and is resource-capped',()=>{
 const s=renderUnit('172.18.0.1');
 assert.match(s,/Environment=HOST=172\.18\.0\.1/);
 assert.match(s,/MemoryMax=128M/);
 assert.match(s,/CPUQuota=12%/);
 assert.match(s,/PUBLIC_BASE_PATH=\/office/);
 assert.doesNotMatch(s,/__NPM_BRIDGE_GATEWAY__/);
});
test('unsafe gateway input is rejected before writing any unit',()=>{
 for(const v of ['0.0.0.999','0.0.0.0','127.0.0.1','127.0.0.1\nExecStart=/bin/sh','host.docker.internal','']) assert.throws(()=>renderUnit(v));
});

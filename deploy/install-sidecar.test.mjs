import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'install-sidecar.sh'), 'utf8');

test('office sidecar uses only cached NPM image layers and no external publishing', () => {
  assert.match(source, /docker image inspect "\$OFFICE_IMAGE_ID"/);
  assert.match(source, /--pull=never/);
  assert.match(source, /--network "\$OFFICE_NETWORK"/);
  assert.match(source, /--read-only --tmpfs/);
  assert.match(source, /--memory 128m --cpus 0\.12 --pids-limit 64/);
  assert.match(source, /--cap-drop ALL --security-opt no-new-privileges/);
  assert.match(source, /office_sidecar_publication=not_published/);
  assert.doesNotMatch(source, /--publish\b|\s-p\s+\d|docker\s+(?:build|pull)|npm\s+install/);
});

test('office sidecar is exact-revision, checks NPM reachability and rolls back only itself', () => {
  assert.match(source, /rev-parse HEAD.*\$OFFICE_SHA/);
  assert.match(source, /trap rollback_own_container EXIT/);
  assert.match(source, /docker stop --time 5 "\$OFFICE_CONTAINER"/);
  assert.match(source, /docker rename "\$OFFICE_CONTAINER"/);
  assert.match(source, /check_from_npm \/office\/ 200/);
  assert.match(source, /check_from_npm \/office\/api\/office\/v1\/snapshot 501/);
  assert.match(source, /check_from_npm \/ 404/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const installer = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'install-preview.sh'), 'utf8');

test('preview has bounded startup readiness and failure rollback', () => {
  assert.match(installer, /for attempt in \{1\.\.20\}; do/);
  assert.match(installer, /OFFICE_READY=1/);
  assert.match(installer, /trap rollback_own_unit EXIT/);
  assert.match(installer, /systemctl disable --now juju-office\.service/);
  assert.match(installer, /office-preview-audit/);
});

test('installer is scoped to office and does not mutate the proxy configuration', () => {
  assert.match(installer, /OFFICE_SERVICE_UNIT='\/etc\/systemd\/system\/juju-office\.service'/);
  assert.match(installer, /test ! -e "\$OFFICE_SERVICE_UNIT"/);
  assert.doesNotMatch(installer, /docker\s+(?:restart|stop|rm)|nginx\s+-s\s+reload/);
});

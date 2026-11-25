#!/usr/bin/env bash
# Only invoke from an approved, exact-revision JUJU host Job. This script
# intentionally does not modify DNS, NPM, JUJU Control Center or other sites.
set -Eeuo pipefail
set +x

OFFICE_EXPECTED_SHA="${1:-}"
OFFICE_PROJECT_DIR='/srv/projects/juju-virtual-office'
OFFICE_SERVICE_UNIT='/etc/systemd/system/juju-office.service'
OFFICE_AUDIT_DIR='/srv/juju-work/juju-office-preview-audit'
OFFICE_INSTALLED=0

if [[ ! "$OFFICE_EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Invalid requested revision' >&2
  exit 2
fi
test "$(hostname)" = juju-mini
test "$(id -un)" = juju
test -d "$OFFICE_PROJECT_DIR/.git"
test ! -e "$OFFICE_SERVICE_UNIT"
test "$(git -C "$OFFICE_PROJECT_DIR" rev-parse HEAD)" = "$OFFICE_EXPECTED_SHA"
test -f "$OFFICE_PROJECT_DIR/site/index.html"
test -f "$OFFICE_PROJECT_DIR/site/assets/office-floor.png"
test -f "$OFFICE_PROJECT_DIR/site/assets/worker-atlas.png"
test -f "$OFFICE_PROJECT_DIR/site/assets/developer-typing.png"
test "$(df -Pk / | awk 'NR==2{print $4}')" -gt 4194304
test "$(awk '/MemAvailable:/{print $2}' /proc/meminfo)" -gt 1048576

if curl -fsS --connect-timeout 2 --max-time 4 http://127.0.0.1:4381/healthz >/dev/null; then
  echo 'Port 4381 is already serving a health endpoint' >&2
  exit 3
fi

OFFICE_GATEWAY="$(docker network inspect npm_proxy --format '{{(index .IPAM.Config 0).Gateway}}')"
OFFICE_UNIT_CANDIDATE="/tmp/juju-office-$OFFICE_EXPECTED_SHA.service"
test ! -e "$OFFICE_UNIT_CANDIDATE"

# All source checks run before any host service mutation.
cd "$OFFICE_PROJECT_DIR"
node --test site/*.test.mjs deploy/*.test.mjs server.test.mjs
node --check site/app.js
node --check site/juju-live.mjs
node --check server.mjs
node deploy/render-unit.mjs "$OFFICE_GATEWAY" "$OFFICE_UNIT_CANDIDATE"

rollback_own_unit() {
  result=$?
  if [[ "$OFFICE_INSTALLED" == 1 && "$result" != 0 ]]; then
    sudo -n systemctl disable --now juju-office.service >/dev/null 2>&1 || true
    sudo -n install -d -m 0750 "$OFFICE_AUDIT_DIR" || true
    sudo -n mv "$OFFICE_SERVICE_UNIT" "$OFFICE_AUDIT_DIR/failed-$OFFICE_EXPECTED_SHA.service" || true
    sudo -n systemctl daemon-reload >/dev/null 2>&1 || true
  fi
  return "$result"
}
trap rollback_own_unit EXIT

sudo -n install -m 0644 "$OFFICE_UNIT_CANDIDATE" "$OFFICE_SERVICE_UNIT"
OFFICE_INSTALLED=1
sudo -n systemctl daemon-reload
sudo -n systemctl enable --now juju-office.service
sudo -n systemctl is-active --quiet juju-office.service

check_http() {
  local path="$1" expected="$2" actual
  actual="$(curl --connect-timeout 3 --max-time 8 -s -o /dev/null -w '%{http_code}' "http://$OFFICE_GATEWAY:4381$path")"
  printf 'JUJU_EVIDENCE office_preview_path=%s status=%s\n' "$path" "$actual"
  test "$actual" = "$expected"
}
check_http /healthz 200
check_http /office/ 200
check_http /office/app.js 200
check_http /office/assets/office-floor.png 200
check_http /office/api/office/v1/snapshot 501
check_http / 404

# Ensure the existing NPM container can reach the isolated bridge service.
docker exec nginx-proxy-manager node -e "fetch('http://$OFFICE_GATEWAY:4381/office/').then(r=>{console.log('JUJU_EVIDENCE office_npm_to_preview_status='+r.status);process.exit(r.status===200?0:1)}).catch(()=>process.exit(1))"

printf 'JUJU_EVIDENCE office_preview_service=active\n'
printf 'JUJU_EVIDENCE office_preview_sha=%s\n' "$OFFICE_EXPECTED_SHA"
printf 'JUJU_EVIDENCE office_preview_npm_route=not_configured\n'

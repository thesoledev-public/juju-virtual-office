#!/usr/bin/env bash
# Exact-revision, no-build/no-pull internal office preview on NPM's network.
# It never edits NPM, DNS, the Control Center or host-published ports.
set -Eeuo pipefail
set +x

OFFICE_SHA="${1:-}"
OFFICE_PROJECT_DIR='/srv/projects/juju-virtual-office'
OFFICE_CONTAINER='juju-office-web'
OFFICE_NETWORK='npm_proxy'
OFFICE_CREATED=0

if [[ ! "$OFFICE_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Exact 40-character public revision required' >&2
  exit 2
fi
test "$(hostname)" = juju-mini
test "$(id -un)" = juju
test -d "$OFFICE_PROJECT_DIR/.git"
test "$(git -C "$OFFICE_PROJECT_DIR" rev-parse HEAD)" = "$OFFICE_SHA"
test -f "$OFFICE_PROJECT_DIR/site/index.html"
test -f "$OFFICE_PROJECT_DIR/site/assets/office-floor.png"
test -f "$OFFICE_PROJECT_DIR/site/assets/worker-atlas.png"
test ! -e /etc/systemd/system/juju-office.service
test "$(df -Pk / | awk 'NR==2{print $4}')" -gt 4194304

# Fail if a container with this name already exists. No takeover of anything.
if docker container inspect "$OFFICE_CONTAINER" >/dev/null 2>&1; then
  echo 'JUJU Office container name is already occupied' >&2
  exit 3
fi
docker network inspect "$OFFICE_NETWORK" >/dev/null
docker network inspect "$OFFICE_NETWORK" --format '{{range .Containers}}{{.Name}} {{end}}' | grep -qw nginx-proxy-manager

# Reuse exactly the pre-existing NPM image layers; never pull latest or build.
OFFICE_IMAGE_ID="$(docker inspect nginx-proxy-manager --format '{{.Image}}')"
docker image inspect "$OFFICE_IMAGE_ID" >/dev/null
test "$(docker inspect nginx-proxy-manager --format '{{.Config.Image}}')" = jc21/nginx-proxy-manager:latest

cd "$OFFICE_PROJECT_DIR"
node --test site/*.test.mjs deploy/*.test.mjs server.test.mjs
node --check server.mjs
node --check site/app.js

# Validate Node in the cached image before writing a persistent container.
docker run --rm --pull=never --network none --read-only \
  --user "$(id -u):$(id -g)" --entrypoint node "$OFFICE_IMAGE_ID" --version

rollback_own_container() {
  result=$?
  if [[ "$OFFICE_CREATED" = 1 && "$result" != 0 ]]; then
    docker stop --time 5 "$OFFICE_CONTAINER" >/dev/null 2>&1 || true
    docker rename "$OFFICE_CONTAINER" "juju-office-failed-${OFFICE_SHA:0:12}" >/dev/null 2>&1 || true
  fi
  return "$result"
}
trap rollback_own_container EXIT

docker run --detach --pull=never \
  --name "$OFFICE_CONTAINER" --hostname "$OFFICE_CONTAINER" \
  --network "$OFFICE_NETWORK" --network-alias "$OFFICE_CONTAINER" \
  --user "$(id -u):$(id -g)" \
  --restart unless-stopped \
  --memory 128m --cpus 0.12 --pids-limit 64 \
  --cap-drop ALL --security-opt no-new-privileges \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --mount "type=bind,src=$OFFICE_PROJECT_DIR,dst=/srv/app,readonly" \
  --workdir /srv/app \
  --env NODE_ENV=production --env HOST=0.0.0.0 \
  --env PORT=4381 --env PUBLIC_BASE_PATH=/office \
  --entrypoint node "$OFFICE_IMAGE_ID" server.mjs >/dev/null
OFFICE_CREATED=1

OFFICE_READY=0
for attempt in {1..24}; do
  if timeout 5s docker exec nginx-proxy-manager node -e \
    "fetch('http://$OFFICE_CONTAINER:4381/healthz',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"; then
    OFFICE_READY=1
    break
  fi
  sleep 0.5
done
if [[ "$OFFICE_READY" != 1 ]]; then
  echo 'NPM container cannot reach the isolated office sidecar' >&2
  exit 4
fi

check_from_npm() {
  local path="$1" expected="$2" actual
  actual="$(docker exec nginx-proxy-manager node -e \
    "fetch('http://$OFFICE_CONTAINER:4381$path',{signal:AbortSignal.timeout(5000)}).then(r=>process.stdout.write(String(r.status))).catch(()=>process.stdout.write('unreachable'))")"
  printf 'JUJU_EVIDENCE office_sidecar_path=%s status=%s\n' "$path" "$actual"
  test "$actual" = "$expected"
}
check_from_npm /healthz 200
check_from_npm /office/ 200
check_from_npm /office/app.js 200
check_from_npm /office/assets/office-floor.png 200
check_from_npm /office/api/office/v1/snapshot 501
check_from_npm / 404

test "$(docker inspect "$OFFICE_CONTAINER" --format '{{.State.Running}}')" = true
test "$(docker inspect "$OFFICE_CONTAINER" --format '{{.HostConfig.ReadonlyRootfs}}')" = true
test "$(docker inspect "$OFFICE_CONTAINER" --format '{{.HostConfig.Memory}}')" = 134217728

printf 'JUJU_EVIDENCE office_sidecar_status=running\n'
printf 'JUJU_EVIDENCE office_sidecar_public_sha=%s\n' "$OFFICE_SHA"
printf 'JUJU_EVIDENCE office_sidecar_image=preexisting_cached_image_id\n'
printf 'JUJU_EVIDENCE office_sidecar_publication=not_published\n'

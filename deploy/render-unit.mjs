import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const template = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'juju-office.service.template'), 'utf8');

export function renderUnit(gateway) {
  if (typeof gateway !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}$/.test(gateway) || gateway.split('.').some(v=>+v > 255)) {
    throw new Error('Expected a verified Docker bridge IPv4 address');
  }
  const [first, second] = gateway.split('.').map(Number);
  if (!(first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168))) {
    throw new Error('Bridge gateway must be a private RFC1918 IPv4 address');
  }
  return template.replaceAll('__NPM_BRIDGE_GATEWAY__', gateway);
}

// This does not install, enable or start a service. It only creates a new
// candidate unit file at the exact path supplied by an approved JUJU job.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [gateway, outFile] = process.argv.slice(2);
  if (!gateway || !outFile || !resolve(outFile).startsWith('/tmp/juju-office-')) {
    throw new Error('Usage: node deploy/render-unit.mjs <bridge_ipv4> /tmp/juju-office-<unique>.service');
  }
  writeFileSync(outFile, renderUnit(gateway), { encoding:'utf8', flag:'wx', mode:0o600 });
}

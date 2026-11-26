import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

// A missing ')' in an animation declaration can make a browser swallow every
// subsequent rule without a network or JavaScript error. That hid the entire
// seated-art section in v5 while the newer JavaScript was running correctly.
test('all CSS blocks, functions and strings are balanced', () => {
  const stack = [];
  let quote = '', comment = false;
  for (let index = 0; index < css.length; index++) {
    const c = css[index], next = css[index + 1];
    if (comment) { if (c === '*' && next === '/') { comment = false; index++; } continue; }
    if (quote) {
      if (c === '\\') { index++; continue; }
      if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && next === '*') { comment = true; index++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{' || c === '(' || c === '[') stack.push({ c, index });
    if (c === '}' || c === ')' || c === ']') {
      const opened = stack.pop();
      assert.equal(opened?.c, { '}':'{', ')':'(', ']':'[' }[c],
        `Unbalanced CSS delimiter ${c} at ${index}, previous ${JSON.stringify(opened)}`);
    }
  }
  assert.equal(comment, false, 'Unclosed CSS comment');
  assert.equal(quote, '', 'Unclosed CSS quote');
  assert.deepEqual(stack, [], 'Unclosed CSS delimiters');
});

test('the final live-worker rules load seated and roaming artwork', () => {
  assert.match(css, /\.person\.seated \.character\s*\{[^}]*worker-seated-atlas-v1\.webp/s);
  assert.match(css, /\.person\.roaming \.character[^{}]*\{[^}]*worker-roaming-atlas-v1\.webp/s);
});

test('HTML uses a release marker for JavaScript and CSS cache coherence', () => {
  const cssVersion = html.match(/href="\.\/styles\.css\?office=([a-zA-Z\d-]+)"/)?.[1];
  const jsVersion = html.match(/src="\.\/app\.js\?office=([a-zA-Z\d-]+)"/)?.[1];
  assert.ok(cssVersion, 'CSS release URL must be revisioned');
  assert.equal(jsVersion, cssVersion, 'JS and CSS must load from the same release');
});

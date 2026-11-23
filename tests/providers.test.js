const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { DEFAULTS } = require('../src/config');
const { detectProvider, resolveSpec } = require('../src/providers');

function fixture() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ndc-provider-'));
}

test('detects OpenSpec and resolves its change artifacts', () => {
  const root = fixture();
  const specRoot = path.join(root, 'openspec', 'changes', 'OPS-184');
  fs.mkdirSync(specRoot, { recursive: true });
  fs.writeFileSync(path.join(specRoot, 'proposal.md'), '# Retry policy\n');

  const detection = detectProvider(root, DEFAULTS);
  const spec = resolveSpec(root, DEFAULTS, 'OPS-184');

  assert.equal(detection.status, 'detected');
  assert.equal(detection.provider, 'openspec');
  assert.equal(spec.artifacts.length, 1);
  assert.equal(spec.artifacts[0].path, 'openspec/changes/OPS-184/proposal.md');
});

test('requires a project selection when both providers are detected', () => {
  const root = fixture();
  fs.mkdirSync(path.join(root, 'openspec'));
  fs.mkdirSync(path.join(root, '.specify'));

  const detection = detectProvider(root, DEFAULTS);

  assert.equal(detection.status, 'ambiguous');
  assert.throws(() => resolveSpec(root, DEFAULTS, 'OPS-184'), /Multiple specification providers/);
});

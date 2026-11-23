const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { loadConfig } = require('../src/config');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devin-context-config-'));
  const projectRoot = path.join(root, 'project');
  const globalRoot = path.join(root, 'global');
  fs.mkdirSync(path.join(projectRoot, '.devin-context'), { recursive: true });
  fs.mkdirSync(globalRoot, { recursive: true });
  return { root, projectRoot, globalRoot, env: { ...process.env, DEVIN_CONTEXT_HOME: globalRoot } };
}

test('project configuration overrides global defaults but not enforced policy', () => {
  const { projectRoot, globalRoot, env } = fixture();
  fs.writeFileSync(path.join(globalRoot, 'config.yaml'), `integration:\n  provider: openspec\npolicy:\n  allowGlobalSearch: false\n  enforced:\n    - policy.allowGlobalSearch\n`);
  fs.writeFileSync(path.join(projectRoot, '.devin-context', 'config.yaml'), `integration:\n  provider: spec-kitty\npolicy:\n  allowGlobalSearch: true\n`);

  const { config, sources } = loadConfig({ projectRoot, env });

  assert.equal(config.integration.provider, 'spec-kitty');
  assert.equal(config.policy.allowGlobalSearch, false);
  assert.equal(sources['policy.allowGlobalSearch'], 'global-enforced');
});

test('project configuration cannot redirect the global knowledge root', () => {
  const { projectRoot, globalRoot, env } = fixture();
  fs.writeFileSync(path.join(projectRoot, '.devin-context', 'config.yaml'), `knowledge:\n  globalRoot: /unapproved\n`);

  const { config, sources } = loadConfig({ projectRoot, env });

  assert.equal(config.knowledge.globalRoot, path.join(globalRoot, 'knowledge'));
  assert.equal(sources['knowledge.globalRoot'], 'default');
});

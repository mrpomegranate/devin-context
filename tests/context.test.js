const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { buildContextPack } = require('../src/context');
const { getPaths } = require('../src/config/paths');

function writeRecord(root, title, id, body) {
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, `${title}.md`), `---\nid: ${id}\ntitle: ${title}\ntype: lesson\nstatus: approved\n---\n\n${body}\n`);
}

test('project records override global records with the same stable ID', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ndc-context-'));
  const projectRoot = path.join(root, 'project');
  const env = { ...process.env, NGC_DEVIN_HOME: path.join(root, 'global') };
  const paths = getPaths(projectRoot, env);
  fs.mkdirSync(projectRoot, { recursive: true });
  writeRecord(paths.projectKnowledge, 'project-retry', 'record-1', 'Project retry guidance');
  writeRecord(paths.globalKnowledge, 'global-retry', 'record-1', 'Global retry guidance');
  writeRecord(paths.globalKnowledge, 'global-telemetry', 'record-2', 'Telemetry guidance');

  const pack = buildContextPack({
    projectRoot,
    paths,
    task: 'retry telemetry',
    config: {
      knowledge: { includeGlobal: true, globalRoot: paths.globalKnowledge },
      policy: { allowGlobalSearch: true },
      validation: { commands: [] },
      integration: { provider: 'auto', roots: { openspec: 'openspec', specKitty: '.specify' } }
    }
  });

  assert.equal(pack.records.filter((record) => record.id === 'record-1').length, 1);
  assert.equal(pack.records.find((record) => record.id === 'record-1').scope, 'project');
});

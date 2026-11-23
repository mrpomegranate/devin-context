const childProcess = require('node:child_process');
const path = require('node:path');
const { listRecords, rankRecords } = require('../knowledge');
const { resolveSpec } = require('../providers');

function gitEvidence(projectRoot) {
  try {
    const runGit = (args) => childProcess.execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return {
      head: runGit(['rev-parse', 'HEAD']),
      changedFiles: runGit(['status', '--short']).split('\n').filter(Boolean)
    };
  } catch {
    return { head: null, changedFiles: [] };
  }
}

function dedupeRecords(projectRecords, globalRecords) {
  const projectIds = new Set(projectRecords.map((record) => record.id).filter(Boolean));
  return [...projectRecords, ...globalRecords.filter((record) => !projectIds.has(record.id))];
}

function buildContextPack({ projectRoot, config, paths, task = '', specId, limit = 8 }) {
  const projectRecords = listRecords(paths.projectKnowledge).map((record) => ({ ...record, sourceScope: 'project' }));
  const globalRecords = config.knowledge.includeGlobal && config.policy.allowGlobalSearch
    ? listRecords(config.knowledge.globalRoot).map((record) => ({ ...record, sourceScope: 'global' }))
    : [];
  const records = rankRecords(dedupeRecords(projectRecords, globalRecords), task).slice(0, limit);
  const spec = specId ? resolveSpec(projectRoot, config, specId) : { provider: null, id: null, artifacts: [] };
  return {
    generatedAt: new Date().toISOString(),
    task,
    spec,
    records: records.map((record) => ({
      id: record.id,
      title: record.title,
      type: record.type,
      scope: record.sourceScope,
      path: path.relative(projectRoot, record.filePath).replaceAll(path.sep, '/'),
      score: record.score,
      evidence: record.evidence || []
    })),
    validation: config.validation.commands,
    git: gitEvidence(projectRoot)
  };
}

function renderContextPack(pack) {
  const lines = [
    '# NGC Devin Context Pack',
    '',
    `- Generated: ${pack.generatedAt}`,
    `- Task: ${pack.task || '(not provided)'}`,
    `- Specification provider: ${pack.spec.provider || '(none)'}`,
    `- Specification ID: ${pack.spec.id || '(none)'}`,
    '',
    '## Authoritative specification artifacts',
    ''
  ];
  lines.push(...(pack.spec.artifacts.length ? pack.spec.artifacts.map((artifact) => `- \`${artifact.path}\` (${artifact.artifact}, sha256:${artifact.sha256})`) : ['- None resolved.']));
  lines.push('', '## Relevant durable knowledge', '');
  lines.push(...(pack.records.length ? pack.records.map((record) => `- [${record.scope}] ${record.type}: **${record.title}** — \`${record.path}\``) : ['- No matching approved records.']));
  lines.push('', '## Validation commands', '');
  lines.push(...(pack.validation.length ? pack.validation.map((command) => `- \`${command}\``) : ['- Not configured.']));
  lines.push('', '## Git evidence', '', `- HEAD: ${pack.git.head || '(not available)'}`);
  lines.push(...(pack.git.changedFiles.length ? pack.git.changedFiles.map((file) => `- Working tree: \`${file}\``) : ['- Working tree: clean or unavailable.']));
  return `${lines.join('\n')}\n`;
}

module.exports = { buildContextPack, renderContextPack };

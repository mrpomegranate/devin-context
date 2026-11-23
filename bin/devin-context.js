#!/usr/bin/env node
const path = require('node:path');
const { loadConfig, stringifyConfig } = require('../src/config');
const { buildContextPack, renderContextPack } = require('../src/context');
const { initializeProject } = require('../src/devin');
const { approveProposal, rankRecords, listRecords, writeProposal } = require('../src/knowledge');
const { detectProvider } = require('../src/providers');

function parseArgs(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) result._.push(value);
    else {
      const [key, inline] = value.slice(2).split('=', 2);
      const next = values[index + 1];
      result[key] = inline ?? (!next || next.startsWith('--') ? true : values[++index]);
    }
  }
  return result;
}

function usage() {
  return `Usage: devin-context <command> [options]

Commands:
  init
  config show [--resolved]
  spec detect
  brief --task <summary> [--spec <id>] [--json]
  context pack --task <summary> [--spec <id>] [--json]
  search <query>
  decision create <title> [--body <text>] [--spec <id>] [--scope project|global]
  handoff create <title> [--body <text>] [--spec <id>] [--scope project|global]
  closeout [--title <title>] [--body <text>] [--spec <id>] [--scope project|global]
  approve <proposal-path>
`;
}

function loaded() {
  return loadConfig({ projectRoot: process.cwd() });
}

function output(value, json) {
  process.stdout.write(json ? `${JSON.stringify(value, null, 2)}\n` : `${value}\n`);
}

function proposal(command, args) {
  const { config, paths } = loaded();
  const title = args._.slice(2).join(' ') || args.title;
  if (!title) throw new Error('A title is required.');
  const type = command === 'handoff' ? 'handoff' : command === 'closeout' ? 'lesson' : 'decision';
  const result = writeProposal(paths, {
    type,
    title,
    scope: args.scope || 'project',
    spec: args.spec || null,
    body: args.body || '',
    evidence: [],
    approved: args.approve === true
  });
  output(`Created ${result.metadata.scope} ${result.metadata.status === 'approved' ? 'record' : 'proposal'}: ${result.filePath}`, args.json);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const [command, subcommand] = args._;
  if (!command || command === 'help' || args.help) return output(usage());

  if (command === 'init') {
    const { config, paths } = loaded();
    output(initializeProject(paths, config).join('\n'));
    return;
  }
  if (command === 'config' && subcommand === 'show') {
    const { config, sources } = loaded();
    if (args.resolved && args.json) output({ config, sources }, true);
    else if (args.resolved) output(`${stringifyConfig(config)}\nSources:\n${stringifyConfig(sources)}`);
    else output(args.json ? config : stringifyConfig(config), args.json);
    return;
  }
  if (command === 'spec' && subcommand === 'detect') {
    const { config } = loaded();
    const result = detectProvider(process.cwd(), config);
    output(result, true);
    process.exitCode = result.status === 'ambiguous' ? 2 : 0;
    return;
  }
  if (command === 'brief' || (command === 'context' && subcommand === 'pack')) {
    const { config, paths } = loaded();
    const pack = buildContextPack({ projectRoot: process.cwd(), config, paths, task: args.task || '', specId: args.spec, limit: Number(args.limit || 8) });
    output(args.json ? pack : renderContextPack(pack), args.json);
    return;
  }
  if (command === 'search') {
    const { config, paths } = loaded();
    const query = args._.slice(1).join(' ');
    if (!query) throw new Error('A search query is required.');
    const records = rankRecords([
      ...listRecords(paths.projectKnowledge).map((record) => ({ ...record, scope: 'project' })),
      ...(config.knowledge.includeGlobal && config.policy.allowGlobalSearch ? listRecords(config.knowledge.globalRoot).map((record) => ({ ...record, scope: 'global' })) : [])
    ], query);
    output(records.map((record) => ({ title: record.title, type: record.type, scope: record.scope, filePath: path.relative(process.cwd(), record.filePath), score: record.score })), true);
    return;
  }
  if (['decision', 'handoff', 'closeout'].includes(command) && (subcommand === 'create' || command === 'closeout')) {
    proposal(command, args);
    return;
  }
  if (command === 'approve') {
    const proposalPath = args._[1];
    if (!proposalPath) throw new Error('A proposal path is required.');
    const { paths } = loaded();
    const result = approveProposal(paths, proposalPath);
    output(`Approved record: ${result.filePath}`, args.json);
    return;
  }
  throw new Error(`Unknown command.\n\n${usage()}`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`devin-context: ${error.message}\n`);
  process.exitCode = 1;
}

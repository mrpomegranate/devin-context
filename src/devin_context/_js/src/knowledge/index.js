const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const YAML = require('yaml');
const { isPathWithin } = require('../config/paths');

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'record';
}

function frontMatter(metadata, body = '') {
  return `---\n${YAML.stringify(metadata).trimEnd()}\n---\n\n${body.trim()}\n`;
}

function parseRecord(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { ...YAML.parse(match[1]), body: match[2].trim(), filePath };
}

function listRecords(root) {
  if (!fs.existsSync(root)) return [];
  const visit = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? visit(target) : target.endsWith('.md') ? [target] : [];
  });
  return visit(root).map(parseRecord).filter(Boolean);
}

function targetPath(root, title) {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(root, `${date}-${slugify(title)}.md`);
}

function writeProposal(paths, { type, title, scope = 'project', spec, body = '', evidence = [], approved = false }) {
  if (scope === 'global' && !approved) {
    throw new Error('Global records require explicit CLI confirmation. Re-run with --approve.');
  }
  const root = scope === 'global' ? path.join(paths.globalKnowledge, `${type}s`) : paths.projectProposals;
  const metadata = {
    id: crypto.randomUUID(),
    title,
    type,
    scope,
    status: scope === 'global' ? 'approved' : 'proposed',
    createdAt: new Date().toISOString(),
    spec: spec || null,
    evidence
  };
  const filePath = targetPath(root, title);
  if (!isPathWithin(root, filePath)) throw new Error('Proposal path is outside the configured root.');
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(filePath, frontMatter(metadata, body));
  return { filePath, metadata };
}

function approveProposal(paths, proposalPath) {
  const proposal = path.resolve(proposalPath);
  if (!isPathWithin(paths.projectProposals, proposal)) throw new Error('Only project proposal files can be approved.');
  const record = parseRecord(proposal);
  if (!record || record.status !== 'proposed') throw new Error('Proposal is missing valid proposed metadata.');
  const knowledgeRoot = paths.projectKnowledge;
  const target = targetPath(path.join(knowledgeRoot, `${record.type}s`), record.title);
  const metadata = { ...record, status: 'approved', approvedAt: new Date().toISOString() };
  delete metadata.body;
  delete metadata.filePath;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, frontMatter(metadata, record.body));
  fs.unlinkSync(proposal);
  return { filePath: target, metadata };
}

function rankRecords(records, query) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return records
    .map((record) => {
      const searchable = `${record.title || ''} ${record.body || ''} ${record.type || ''}`.toLowerCase();
      return { ...record, score: tokens.reduce((score, token) => score + (searchable.includes(token) ? 1 : 0), 0) };
    })
    .filter((record) => record.score > 0 || tokens.length === 0)
    .sort((left, right) => right.score - left.score || String(right.createdAt || '').localeCompare(String(left.createdAt || '')));
}

module.exports = { approveProposal, frontMatter, listRecords, rankRecords, writeProposal };

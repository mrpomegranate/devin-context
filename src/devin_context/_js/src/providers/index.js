const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function existsDirectory(target) {
  return fs.existsSync(target) && fs.statSync(target).isDirectory();
}

function providerCandidates(projectRoot, config) {
  const roots = config.integration.roots;
  return [
    { name: 'openspec', root: path.resolve(projectRoot, roots.openspec), marker: path.resolve(projectRoot, roots.openspec) },
    { name: 'spec-kitty', root: path.resolve(projectRoot, roots.specKitty), marker: path.resolve(projectRoot, roots.specKitty) }
  ].filter((candidate) => existsDirectory(candidate.marker));
}

function detectProvider(projectRoot, config) {
  if (config.integration.provider && config.integration.provider !== 'auto') {
    const candidate = providerCandidates(projectRoot, config).find((item) => item.name === config.integration.provider);
    return {
      status: candidate ? 'selected' : 'configured-missing',
      provider: config.integration.provider,
      candidates: candidate ? [candidate] : []
    };
  }
  const candidates = providerCandidates(projectRoot, config);
  if (candidates.length === 0) return { status: 'none', provider: null, candidates };
  if (candidates.length > 1) return { status: 'ambiguous', provider: null, candidates };
  return { status: 'detected', provider: candidates[0].name, candidates };
}

function listFiles(root) {
  if (!existsDirectory(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function referenceFor(filePath, projectRoot, provider, id) {
  const text = fs.readFileSync(filePath, 'utf8');
  return {
    provider,
    id,
    artifact: path.basename(filePath),
    path: path.relative(projectRoot, filePath).replaceAll(path.sep, '/'),
    sha256: crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
  };
}

function resolveSpec(projectRoot, config, id) {
  const detection = detectProvider(projectRoot, config);
  if (detection.status === 'ambiguous') {
    throw new Error(`Multiple specification providers detected: ${detection.candidates.map((candidate) => candidate.name).join(', ')}. Set integration.provider in .devin-context/config.yaml.`);
  }
  if (!detection.provider) return { provider: null, id, artifacts: [] };
  const candidate = detection.candidates[0];
  const providerRoots = detection.provider === 'openspec'
    ? [path.join(candidate.root, 'changes', id), path.join(candidate.root, id)]
    : [path.join(candidate.root, 'specs', id), path.join(candidate.root, id)];
  const specRoot = providerRoots.find(existsDirectory);
  if (!specRoot) return { provider: detection.provider, id, artifacts: [] };
  return {
    provider: detection.provider,
    id,
    artifacts: listFiles(specRoot)
      .filter((filePath) => /\.(md|ya?ml|json)$/i.test(filePath))
      .map((filePath) => referenceFor(filePath, projectRoot, detection.provider, id))
  };
}

module.exports = { detectProvider, resolveSpec };

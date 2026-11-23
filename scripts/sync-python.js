const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const jsDest = path.join(repoRoot, 'src', 'ngc_devin_context', '_js');

fs.rmSync(jsDest, { recursive: true, force: true });
fs.mkdirSync(jsDest, { recursive: true });

// Copy bin
fs.cpSync(path.join(repoRoot, 'bin'), path.join(jsDest, 'bin'), { recursive: true });

// Copy src modules
for (const sub of ['config', 'context', 'devin', 'knowledge', 'providers']) {
  fs.cpSync(path.join(repoRoot, 'src', sub), path.join(jsDest, 'src', sub), { recursive: true });
}

// Copy node_modules/yaml
if (fs.existsSync(path.join(repoRoot, 'node_modules', 'yaml'))) {
  fs.cpSync(path.join(repoRoot, 'node_modules', 'yaml'), path.join(jsDest, 'node_modules', 'yaml'), { recursive: true });
}

// Copy package.json
fs.copyFileSync(path.join(repoRoot, 'package.json'), path.join(jsDest, 'package.json'));

console.log('Successfully synced JS bundle to src/ngc_devin_context/_js');

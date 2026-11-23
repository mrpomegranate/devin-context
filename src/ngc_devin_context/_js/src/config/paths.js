const os = require('node:os');
const path = require('node:path');

function getGlobalRoot(env = process.env) {
  return env.NGC_DEVIN_HOME || path.join(os.homedir(), '.config', 'ngc-devin');
}

function getPaths(projectRoot = process.cwd(), env = process.env) {
  const globalRoot = getGlobalRoot(env);
  const projectConfigRoot = path.join(projectRoot, '.ngc-devin');
  return {
    globalRoot,
    globalConfig: path.join(globalRoot, 'config.yaml'),
    globalKnowledge: path.join(globalRoot, 'knowledge'),
    projectRoot,
    projectConfigRoot,
    projectConfig: path.join(projectConfigRoot, 'config.yaml'),
    projectKnowledge: path.join(projectConfigRoot, 'knowledge'),
    projectProposals: path.join(projectConfigRoot, 'proposals'),
    projectSkill: path.join(projectRoot, '.devin', 'skills', 'ngc-devin-context', 'SKILL.md'),
    agents: path.join(projectRoot, 'AGENTS.md')
  };
}

function isPathWithin(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

module.exports = { getGlobalRoot, getPaths, isPathWithin };

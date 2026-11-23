const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const { getPaths, isPathWithin } = require('./paths');

const DEFAULTS = {
  version: 1,
  integration: {
    provider: 'auto',
    roots: {
      openspec: 'openspec',
      specKitty: '.specify'
    }
  },
  knowledge: {
    projectRoot: '.devin-context/knowledge',
    globalRoot: null,
    includeGlobal: true
  },
  policy: {
    enforced: [],
    allowGlobalSearch: true
  },
  validation: {
    commands: []
  }
};

function readYaml(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const parsed = YAML.parse(fs.readFileSync(filePath, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Configuration at ${filePath} must be a mapping.`);
  }
  return parsed;
}

function deepMerge(base, next) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(next || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      merged[key] = deepMerge(base[key], value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function getAtPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current?.[key], value);
}

function setAtPath(value, dottedPath, replacement) {
  const keys = dottedPath.split('.');
  let target = value;
  for (let index = 0; index < keys.length - 1; index += 1) {
    target[keys[index]] = target[keys[index]] || {};
    target = target[keys[index]];
  }
  target[keys.at(-1)] = replacement;
}

function leafSources(value, source, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) leafSources(child, source, childPath, result);
    else result[childPath] = source;
  }
  return result;
}

function loadConfig({ projectRoot = process.cwd(), env = process.env, overrides = {} } = {}) {
  const paths = getPaths(projectRoot, env);
  const global = readYaml(paths.globalConfig);
  const project = readYaml(paths.projectConfig);
  const config = deepMerge(deepMerge(deepMerge(structuredClone(DEFAULTS), global), project), overrides);
  config.knowledge.globalRoot = global.knowledge?.globalRoot || paths.globalKnowledge;
  config.knowledge.projectRoot = path.resolve(projectRoot, config.knowledge.projectRoot);
  if (!isPathWithin(projectRoot, config.knowledge.projectRoot)) {
    throw new Error('knowledge.projectRoot must remain inside the project root.');
  }

  const sources = {
    ...leafSources(DEFAULTS, 'default'),
    ...leafSources(global, 'global'),
    ...leafSources(project, 'project'),
    ...leafSources(overrides, 'command')
  };

  for (const enforcedPath of global.policy?.enforced || []) {
    const globalValue = getAtPath(global, enforcedPath);
    if (globalValue !== undefined) {
      setAtPath(config, enforcedPath, globalValue);
      sources[enforcedPath] = 'global-enforced';
    }
  }
  sources['knowledge.globalRoot'] = global.knowledge?.globalRoot ? 'global' : 'default';

  return { config, paths, sources, global, project };
}

function stringifyConfig(config) {
  return YAML.stringify(config, { lineWidth: 0 });
}

module.exports = { DEFAULTS, deepMerge, loadConfig, readYaml, stringifyConfig };

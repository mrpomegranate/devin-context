# Configuration

NGC Devin Context loads configuration in this order:

1. Built-in defaults
2. `~/.config/ngc-devin/config.yaml`
3. `<repository>/.ngc-devin/config.yaml`

Run `ndc config show --resolved --json` to inspect the effective
configuration and field provenance.

## Project configuration

```yaml
version: 1
integration:
  provider: auto
  roots:
    openspec: openspec
    specKitty: .specify
knowledge:
  includeGlobal: true
validation:
  commands:
    - npm test
```

Set `integration.provider` to `openspec` or `spec-kitty` when both providers
are detected. Do not rely on automatic merging of two specification systems.

## Global policy

Global configuration may define values projects cannot replace:

```yaml
policy:
  allowGlobalSearch: false
  enforced:
    - policy.allowGlobalSearch
```

The value of each path listed in `policy.enforced` is taken from global
configuration even when a project config supplies a different value.

## Security

Configuration controls paths and behavior only. It must not contain API keys,
passwords, tokens, or other secret values. The MVP reads only local,
configured knowledge and specification files.

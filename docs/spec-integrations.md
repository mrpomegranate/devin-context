# OpenSpec and Spec-Kitty Integrations

Devin Context does not replace a specification workflow.

- OpenSpec or Spec-Kitty owns a change's requirements, design, implementation
  plan, tasks, and acceptance criteria.
- Devin Context links the relevant artifacts into a Context Pack alongside
  durable decisions, handoffs, runbooks, lessons, and evidence.

## Detection

The MVP uses configurable local markers:

| Provider | Default root |
| --- | --- |
| OpenSpec | `openspec` |
| Spec-Kitty | `.specify` |

These defaults can be changed in `.devin-context/config.yaml`. `devin-context spec detect`
performs no writes.

| Result | Behavior |
| --- | --- |
| One provider found | Use it for the current Context Pack |
| No provider found | Build a provider-neutral Context Pack |
| Both providers found | Stop and require `integration.provider` to be set |

## Resolving a specification

For OpenSpec, `devin-context brief --spec <id>` looks first for
`openspec/changes/<id>`, then `openspec/<id>`.

For Spec-Kitty, it looks first for `.specify/specs/<id>`, then
`.specify/<id>`.

The resulting Context Pack contains relative paths and content hashes for
Markdown, YAML, and JSON artifacts. It does not rewrite or duplicate them.

## Future adapter hardening

Before declaring a provider adapter production-ready, validate its markers,
artifact layout, and lifecycle states against the supported version of that
provider. The MVP keeps roots configurable because this repository does not
yet contain reference checkouts of either tool.

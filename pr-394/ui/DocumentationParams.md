# DocumentationParams

- Kind: component
- Import: `import { DocumentationParams } from "shelving/ui";`

Render a documented symbol's parameters as a scrollable table — one row per parameter.
- Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
- A union type renders one linked token per member, each on its own line; a `| undefined` member is dropped and instead marks the parameter optional.
- Descriptions render as inline markup, with a trailing `Defaults to …` (linked when documented) or `Required.` note — see `DocumentationDescription`. A row with no hand-written description falls back to the referenced type's own `description`.
- An options-bag parameter whose type resolves to a documented interface/object type is flattened into indented child rows (one per property), so readers see the individual fields inline.
- Renders nothing when there are no parameters.

## Signatures

```ts
DocumentationParams({ params }: DocumentationParamsProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationParamsProps` |  |
| `.params` | `ImmutableArray<DocumentationParam> \| undefined` | Parameters to render — one row each, with options-bag params flattened into indented child rows. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationParams params={params} />
```

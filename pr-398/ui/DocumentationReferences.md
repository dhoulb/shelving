# DocumentationReferences

- Kind: component
- Import: `import { DocumentationReferences } from "shelving/ui";`

Render a `type` alias's referenced type names as a scrollable table — one row per referenced type.
- Self-contained: pulls its own copy of the tree map from `useTreeMap()` so each name links to its documented page via `TreeLink` (exact-match only; unresolved names stay plain text), with the row carrying the resolved element's `description`.
- Renders nothing when there are no referenced types.

## Signatures

```ts
DocumentationReferences({ types }: DocumentationReferencesProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationReferencesProps` |  |
| `.types` | `ImmutableArray<string> \| undefined` | Type names referenced by a `type` alias's body — one row each, resolved to links at render time. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationReferences types={types} />
```

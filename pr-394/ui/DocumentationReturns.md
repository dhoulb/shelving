# DocumentationReturns

- Kind: component
- Import: `import { DocumentationReturns } from "shelving/ui";`

Render a documented symbol's `@returns` entries as a scrollable table — one row per return type.
- Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
- A row with no hand-written description falls back to the referenced type's own `description`.
- Renders nothing when there are no return entries.

## Signatures

```ts
DocumentationReturns({ returns }: DocumentationReturnsProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationReturnsProps` |  |
| `.returns` | `ImmutableArray<DocumentationReturn> \| undefined` | Return entries to render — one row per documented return type. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationReturns returns={returns} />
```

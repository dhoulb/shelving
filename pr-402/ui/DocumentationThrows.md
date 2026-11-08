# DocumentationThrows

- Kind: component
- Import: `import { DocumentationThrows } from "shelving/ui";`

Render a documented symbol's `@throws` entries as a scrollable table — one row per thrown type.
- Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
- A row with no hand-written description falls back to the referenced type's own `description`.
- Renders nothing when there are no throw entries.

## Signatures

```ts
DocumentationThrows({ throws }: DocumentationThrowsProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationThrowsProps` |  |
| `.throws` | `ImmutableArray<DocumentationThrow> \| undefined` | Throw entries to render — one row per documented thrown type. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationThrows throws={throws} />
```

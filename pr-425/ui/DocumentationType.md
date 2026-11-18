# DocumentationType

- Kind: component
- Import: `import { DocumentationType } from "shelving/ui";`

Render a documentation table's `Type` column — one linked token per union member, each stacked on its own line.
- Each member links to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).

## Signatures

```ts
DocumentationType({ members }: DocumentationTypeProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationTypeProps` |  |
| `.members` | `readonly string[]` | Union members to render — one linked token each, stacked on their own line. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationType members={["Schemas<T>", "DataSchema<T>"]} />
```

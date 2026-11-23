# DocumentationKind

- Kind: component
- Import: `import { DocumentationKind } from "shelving/ui";`

Colour-coded tag for a documented symbol's kind.
- Thin wrapper over `<Tag>` that maps the kind string to a raw colour variant.

## Signatures

```ts
DocumentationKind({ kind = "unknown", ...props }: DocumentationKindProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationKindProps` |  |
| `.kind` | `string` | The documentation kind (e.g. `"component"`, `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"static method"`, `"property"`, `"static property"`). Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<DocumentationKind kind="function" />
```

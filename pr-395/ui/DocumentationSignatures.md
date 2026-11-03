# DocumentationSignatures

- Kind: component
- Import: `import { DocumentationSignatures } from "shelving/ui";`

Render a documented symbol's signature(s) as monospace code blocks — one `<Preformatted>` per overload.
- Shared by `DocumentationCard` and `DocumentationPage` so signatures render identically in both (calm code
  blocks, not a shouty heading).
- Renders nothing when there are no signatures.

## Signatures

```ts
DocumentationSignatures({ signatures }: DocumentationSignaturesProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationSignaturesProps` |  |
| `.signatures` | `ImmutableArray<string> \| undefined` | Type signatures to render — one block per overload. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationSignatures signatures={["getArray<T>(arr: T[]): T"]} />
```

# Superscript

- Kind: component
- Import: `import { Superscript } from "shelving/ui";`

Superscript text — renders a `<sup>` element for typographically raised text (e.g. exponents, footnote markers).

## Signatures

```ts
Superscript({ children, className }: SuperscriptProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SuperscriptProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<>E = mc<Superscript>2</Superscript></>
```

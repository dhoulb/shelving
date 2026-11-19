# Preformatted

- Kind: component
- Import: `import { Preformatted } from "shelving/ui";`

Preformatted block of text — rendered as `<pre>`.
- Lines are not wrapped by default — overflowing content scrolls horizontally within the block.
- Pass `wrap` to wrap long lines instead; newlines and indentation are preserved either way.

## Signatures

```ts
Preformatted({ children, className, ...variants }: PreformattedProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `PreformattedProps` |  |
| `.wrap` | `boolean \| undefined` | Enable line wrapping (default is nowrap). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Preformatted>{"line one\nline two"}</Preformatted>
```

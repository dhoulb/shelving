# getScrollClass()

- Kind: function
- Import: `import { getScrollClass } from "shelving/ui";`

Get the scroll class for a component from its `horizontal` / `vertical` variant props.

## Signatures

```ts
getScrollClass({ horizontal, vertical }: ScrollVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ScrollVariants` |  |
| `.vertical` | `boolean \| undefined` | Vertical scrolling (defaults to `false`). Optional. |
| `.horizontal` | `boolean \| undefined` | Horizontal scrolling (defaults to `false`). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined scroll class string (empty when neither axis is enabled). |

## Examples

```ts
getScrollClass({ horizontal: true }) // "horizontal"
```

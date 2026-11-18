# getScrollClass()

- Kind: function
- Import: `import { getScrollClass } from "shelving/ui";`

Get the scroll class for a component from its `horizontal`, `vertical`, `cover` and `reverse` variant props.

## Signatures

```ts
getScrollClass({ horizontal, vertical, cover, reverse }: ScrollVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ScrollVariants` |  |
| `.vertical` | `boolean \| undefined` | Vertical scrolling (defaults to `false`). Optional. |
| `.horizontal` | `boolean \| undefined` | Horizontal scrolling (defaults to `false`). Optional. |
| `.cover` | `boolean \| undefined` | Cover the nearest positioned ancestor (`position: absolute; inset: 0`), for example a layout's content slot (defaults to `false`). Optional. |
| `.reverse` | `boolean \| undefined` | Start at the end and stay there as the content grows, for example a chat (defaults to `false`). Put the content in one child. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined scroll class string (empty when neither axis is enabled). |

## Examples

```ts
getScrollClass({ horizontal: true }) // "horizontal"
```

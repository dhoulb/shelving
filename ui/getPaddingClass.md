# getPaddingClass()

- Kind: function
- Import: `import { getPaddingClass } from "shelving/ui";`

Get the block-padding class for a component from its `padding` variant prop.

## Signatures

```ts
getPaddingClass({ padding }: PaddingVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `PaddingVariants` |  |
| `.padding` | `SpaceValue \| undefined` | Block-padding (top + bottom) of the element. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The padding class string, or `undefined` when no `padding` is set. |

## Examples

```ts
getPaddingClass({ padding: "large" }) // "large"
```

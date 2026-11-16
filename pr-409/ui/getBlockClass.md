# getBlockClass()

- Kind: function
- Import: `import { getBlockClass } from "shelving/ui";`

Get the combined `className` string for a block from its styling variants.

Composes the base block class and tint ladder with the colour, space, typography, and width variant helpers, plus the `middle` variant, so anything that wants block-level styling can apply it.

## Signatures

```ts
getBlockClass(variants: BlockVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `BlockVariants` |  |
| `.middle` | `boolean \| undefined` | Make the block at least as tall as its container, and centre its content vertically (defaults to `false`). - Content taller than the container makes the block grow, so a scroll box scrolls it from the top and nothing is cut off. - Has no effect on flex components such as `<Row>` and `<Column>`: wrap them in a `<Block middle>`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A space-separated `className` string combining the block class and resolved variant classes. |

## Examples

```ts
getBlockClass({ space: "large" }) // "block tint …"
```

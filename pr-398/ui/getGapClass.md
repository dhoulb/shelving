# getGapClass()

- Kind: function
- Import: `import { getGapClass } from "shelving/ui";`

Get the gap class for a component from its `gap` variant prop.

## Signatures

```ts
getGapClass({ gap }: GapVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `GapVariants` |  |
| `.gap` | `SpaceValue \| undefined` | Gap between child elements. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The gap class string, or `undefined` when no `gap` is set. |

## Examples

```ts
getGapClass({ gap: "large" }) // "large"
```

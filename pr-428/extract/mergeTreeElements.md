# mergeTreeElements()

- Kind: function
- Import: `import { mergeTreeElements } from "shelving/extract";`

Merge two tree elements — `primary` keeps its identity (`type`, `key`, `source`); `secondary` contributes any
metadata `primary` does not already have.
- `title` and `description` are taken from `primary` when set, otherwise from `secondary` — primary stays canonical
  but a missing field falls back rather than disappearing.
- `content` and `children` from both are concatenated (primary first).

## Signatures

```ts
mergeTreeElements(primary: T, secondary: TreeElement): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `primary` | `T` | The element whose identity is preserved and whose set fields win. |
| `secondary` | `TreeElement` | The element whose metadata fills any gaps in `primary`. |
| `.key` | `string` | Read only. |
| `.type` | `` `tree-${string}` `` | Read only. |

## Returns

| Type | Description |
| --- | --- |
| `T` | A new `TreeElement` with `primary`'s identity and the merged metadata of both. |

## Examples

```ts
mergeTreeElements(tsElement, mdElement) // ts identity + md prose
```

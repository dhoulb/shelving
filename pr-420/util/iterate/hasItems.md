# hasItems()

- Kind: function
- Import: `import { hasItems } from "shelving/util/iterate";`

Does an iterable have one or more items.
- Stops as soon as the first item is found, so it never fully consumes the iterable.

## Signatures

```ts
hasItems(items: Iterable<unknown>): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<unknown>` | The iterable to test. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if the iterable yields at least one item, otherwise `false`. |

# countItems()

- Kind: function
- Import: `import { countItems } from "shelving/util/iterate";`

Count the number of items in an iterable.
- Fully consumes the iterable to count its iterations.

## Signatures

```ts
countItems(items: Iterable<unknown>): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<unknown>` | The iterable to count. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The number of items yielded by the iterable. |

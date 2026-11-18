# pickItems()

- Kind: function
- Import: `import { pickItems } from "shelving/util/iterate";`

Pick items from an iterable set of items.
- Only yields items that appear in the `pick` list.

## Signatures

```ts
pickItems(items: Iterable<T>, ...pick: T[]): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to filter. |
| `pick` | `T[]` | The items to keep. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding only the items found in `pick`. |

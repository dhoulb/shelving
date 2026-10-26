# omitItems()

- Kind: function
- Import: `import { omitItems } from "shelving/util/iterate";`

Omit items from an iterable set of items.
- Yields every item except those that appear in the `omit` list.

## Signatures

```ts
omitItems(items: Iterable<T>, ...omit: T[]): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to filter. |
| `omit` | `T[]` | The items to remove. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding every item not found in `omit`. |

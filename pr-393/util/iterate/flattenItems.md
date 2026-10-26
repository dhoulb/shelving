# flattenItems()

- Kind: function
- Import: `import { flattenItems } from "shelving/util/iterate";`

Flatten one or more (possibly nested) iterables into a flat sequence of items.

## Signatures

```ts
flattenItems(items: DeepIterable<T>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `DeepIterable<T>` | The item or deeply-nested iterable of items to flatten. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding every leaf item in order. |

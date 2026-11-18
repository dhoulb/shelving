# limitItems()

- Kind: function
- Import: `import { limitItems } from "shelving/util/iterate";`

Apply a limit to an iterable set of items.
- Stops yielding once `limit` items have been produced.

## Signatures

```ts
limitItems(items: Iterable<T>, limit: number): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to limit. |
| `limit` | `number` | The maximum number of items to yield. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding at most `limit` items. |

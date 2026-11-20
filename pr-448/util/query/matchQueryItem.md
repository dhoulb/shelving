# matchQueryItem()

- Kind: function
- Import: `import { matchQueryItem } from "shelving/util/query";`

Match a single data item against a set of filters.

## Signatures

```ts
matchQueryItem(item: T, filters: ImmutableArray<QueryFilter>): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `item` | `T` | The data item to test. |
| `filters` | `ImmutableArray<QueryFilter>` | The set of filters that the item must satisfy. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if the item matches every filter, `false` otherwise. |

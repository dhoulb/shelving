# getQueryOrders()

- Kind: function
- Import: `import { getQueryOrders } from "shelving/util/query";`

Get the `QueryOrder` objects decoded from a query.

## Signatures

```ts
getQueryOrders({ $order }: Query<T>): ImmutableArray<QueryOrder>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to extract sort orders from (reads its `$order` prop). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<QueryOrder>` | Array of decoded `QueryOrder` objects (`!`-prefixed keys are descending, others ascending). |

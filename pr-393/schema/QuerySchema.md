# QuerySchema

- Kind: class
- Import: `import { QuerySchema } from "shelving/schema";`
- Extends: `Schema<Query<T>>`

Schema that validates a `Query` against the schema of the data objects it filters and sorts.

- Each filter key, without its operator, is a prop path of `data` (e.g. `sub.num`). `getDataSchemaProp()` finds the schema for the path.
- A plain or `!` key takes one value, or an array of values (the "in" / "out" form). Each value is validated against the prop schema.
- A range key (`a<`, `a<=`, `a>`, `a>=`) takes one value, validated against the prop schema.
- A contains key (`a[]`) needs an `ArraySchema` prop. Its value is validated against `ArraySchema.items`.
- Each `$order` key, without its `!`, must be a prop path. `$limit` must be a positive integer.
- An unknown key throws, because a query without one of its filters matches more items. `undefined` values are removed.

## Signatures

```ts
new QuerySchema<T>({ data, one = "query", title = "Query", value = {}, ...options }: QuerySchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `QuerySchemaOptions<T>` |  |
| `.data` | `DataSchema<T>` | Schema for the data objects the query filters and sorts. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `QuerySchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `DataSchema<T>` | Read only. |

## Examples

```ts
const schema = new QuerySchema({ data: DATA({ num: NUMBER, tags: ARRAY(STRING) }) });
 schema.validate({ "num>": 1, "tags[]": "a", $order: "!num", $limit: 10 }); // Same query.
```

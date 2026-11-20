# getDataSchemaProp()

- Kind: function
- Import: `import { getDataSchemaProp } from "shelving/schema";`

Get the schema for an optional (possibly deep) prop of a `DataSchema`, or `undefined` if it doesn't exist.

- The schema twin of `getDataProp()`: it walks `DataSchema.props` one path segment at a time.
- Goes through wrapper schemas (e.g. `NULLABLE()`, `OPTIONAL()`) with `getSourceSchema()`, and through the `items` of a `DictionarySchema`.
- The schema it returns is not unwrapped, so e.g. a nullable prop still allows `null`.

## Signatures

```ts
getDataSchemaProp(schema: DataSchema<T>, path: K): Schema<BranchData<T>[K]>
getDataSchemaProp(schema: DataSchema<Data>, path: string | Segments): Schema<unknown> | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `schema` | `DataSchema<T>` | The `DataSchema` to read from. |
| `path` | `K` | The dotted path string (e.g. `"a.b"`) or an array of segments pointing at the prop. |
| `schema` | `DataSchema<Data>` |  |
| `path` | `string \| Segments` |  |

## Returns

| Type | Description |
| --- | --- |
| `Schema<BranchData<T>[K]>` | The schema at the path, or `undefined` if any segment along the path doesn't exist. |
| `Schema<unknown> \| undefined` |  |

## Examples

```ts
getDataSchemaProp(DATA({ sub: DATA({ num: NUMBER }) }), "sub.num") // NUMBER
```

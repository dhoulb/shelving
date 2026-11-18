# COLLECTION()

- Kind: function
- Import: `import { COLLECTION } from "shelving/db";`

Create a `Collection` from a name, an identifier schema, and a data schema.

*Factory for `Collection`.*

## Signatures

```ts
COLLECTION(name: K, id: Schema<I>, data: Schemas<T> | DataSchema<T>): Collection<K, I, T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `K` | Collection name used as the table/collection key. |
| `id` | `Schema<I>` | Schema for the identifier type. |
| `data` | `Schemas<T> \| DataSchema<T>` | Data schema, or the `Schemas` props used to construct one. |

## Returns

| Type | Description |
| --- | --- |
| `Collection<K, I, T>` |  |

## Examples

```ts
COLLECTION("users", ID, { name: STRING, age: NUMBER }) // Collection<"users", number, { name: string; age: number }>
```

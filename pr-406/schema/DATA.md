# DATA()

- Kind: function
- Import: `import { DATA } from "shelving/schema";`

Create a `DataSchema` for a set of properties.

Sugar factory for `DataSchema`.

## Signatures

```ts
DATA(props: Schemas<T>): DataSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `Schemas<T>` | A named schema for each property of the data object. |

## Returns

| Type | Description |
| --- | --- |
| `DataSchema<T>` |  |

## Examples

```ts
DATA({ name: STRING, age: NUMBER }) // DataSchema<{ name: string; age: number }>
```

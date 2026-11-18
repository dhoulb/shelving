# PARTIAL()

- Kind: function
- Import: `import { PARTIAL } from "shelving/schema";`

Create a `DataSchema` that validates partially, i.e. every property can be its value or `undefined`.

Sugar factory for `DataSchema`.

## Signatures

```ts
PARTIAL(source: Schemas<T> | DataSchema<T>): DataSchema<PartialData<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Schemas<T> \| DataSchema<T>` | The props schemas or an existing `DataSchema` to make partial. |

## Returns

| Type | Description |
| --- | --- |
| `DataSchema<PartialData<T>>` |  |

## Examples

```ts
PARTIAL({ name: STRING, age: NUMBER }) // DataSchema<{ name?: string; age?: number }>
```

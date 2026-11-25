# VECTOR()

- Kind: function
- Import: `import { VECTOR } from "shelving/schema";`

Create a `VectorSchema` for a vector of an exact size.

Sugar factory for `VectorSchema`.

## Signatures

```ts
VECTOR(size: number): VectorSchema
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `size` | `number` | The exact number of numbers in the vector. |

## Returns

| Type | Description |
| --- | --- |
| `VectorSchema` |  |

## Examples

```ts
VECTOR(768).validate(embedding);
```

# ARRAY()

- Kind: function
- Import: `import { ARRAY } from "shelving/schema";`

Create a schema for a valid array with specified items.

Sugar factory for `ArraySchema`.

## Signatures

```ts
ARRAY(items: Schema<T>): ArraySchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Schema<T>` | Schema every item in the array must conform to. |

## Returns

| Type | Description |
| --- | --- |
| `ArraySchema<T>` |  |

## Examples

```ts
ARRAY(NUMBER) // ArraySchema<number>
```

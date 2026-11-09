# fromProp()

- Kind: function
- Import: `import { fromProp } from "shelving/util/object";`

Create an object from a single prop.

## Signatures

```ts
fromProp(key: K, value: V): { readonly [KK in K]: V }
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `key` | `K` | The key of the prop to set. |
| `value` | `V` | The value of the prop to set. |

## Returns

| Type | Description |
| --- | --- |
| `{ readonly [KK in K]: V }` | A new object containing only the single prop. |

# cloneObjectWith()

- Kind: function
- Import: `import { cloneObjectWith } from "shelving/util/object";`

Shallow clone an object with a single changed value.
- If the value is unchanged the original object is returned unchanged.

## Signatures

```ts
cloneObjectWith(input: T, key: K, value: T[K]): T
cloneObjectWith(input: T, key: K, value: V): T & { [KK in K]: V }
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `T` | The object to clone. |
| `key` | `K` | The key of the prop to change. |
| `value` | `T[K]` | The value of the prop to change. |
| `input` | `T` |  |
| `key` | `K` |  |
| `value` | `V` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | A new object with the changed prop, or the original object if the value was unchanged. |
| `T & { [KK in K]: V }` |  |

# withProp()

- Kind: function
- Import: `import { withProp } from "shelving/util/object";`

Set a prop on an object (immutably) and return a new object including that prop.
- If the value is unchanged the original object is returned unchanged.

## Signatures

```ts
withProp(input: T, key: K, value: T[K]): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `T` | The object to set the prop on. |
| `key` | `K` | The key of the prop to set. |
| `value` | `T[K]` | The value of the prop to set. |

## Returns

| Type | Description |
| --- | --- |
| `T` | A new object including the set prop, or the original object if the value was unchanged. |

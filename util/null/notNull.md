# notNull()

- Kind: function
- Import: `import { notNull } from "shelving/util/null";`

Is a value not `null`?

## Signatures

```ts
notNull(value: Nullable<T>): value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullable<T>` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is T` | `true` if `value` is not `null`, otherwise `false`. |

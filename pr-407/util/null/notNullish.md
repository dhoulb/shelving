# notNullish()

- Kind: function
- Import: `import { notNullish } from "shelving/util/null";`

Is a value not nullish (not `null` and not `undefined`)?

## Signatures

```ts
notNullish(value: Nullish<T>): value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<T>` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is T` | `true` if `value` is not `null` and not `undefined`, otherwise `false`. |

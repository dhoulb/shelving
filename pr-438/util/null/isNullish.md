# isNullish()

- Kind: function
- Import: `import { isNullish } from "shelving/util/null";`

Is a value nullish (`null` or `undefined`)?

## Signatures

```ts
isNullish(value: Nullish<T>): value is null | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<T>` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is null \| undefined` | `true` if `value` is `null` or `undefined`, otherwise `false`. |

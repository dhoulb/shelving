# assertNullish()

- Kind: function
- Import: `import { assertNullish } from "shelving/util/null";`

Assert that a value is nullish (`null` or `undefined`).

## Signatures

```ts
assertNullish(value: Nullish<T>, caller: AnyCaller = assertNullish): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<T>` | The value to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertNullish`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` | Nothing; narrows `value` to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is not `null` or `undefined`. |

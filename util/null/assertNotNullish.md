# assertNotNullish()

- Kind: function
- Import: `import { assertNotNullish } from "shelving/util/null";`

Assert that a value is not nullish (not `null` and not `undefined`).

## Signatures

```ts
assertNotNullish(value: Nullish<T>, caller: AnyCaller = assertNotNullish): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<T>` | The value to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertNotNullish`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` | Nothing; narrows `value` to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is `null` or `undefined`. |

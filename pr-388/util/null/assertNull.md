# assertNull()

- Kind: function
- Import: `import { assertNull } from "shelving/util/null";`

Assert that a value is `null`.

## Signatures

```ts
assertNull(value: Nullable<T>, caller: AnyCaller = assertNull): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullable<T>` | The value to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertNull`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` | Nothing; narrows `value` to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is not `null`. |

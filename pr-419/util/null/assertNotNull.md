# assertNotNull()

- Kind: function
- Import: `import { assertNotNull } from "shelving/util/null";`

Assert that a value is not `null`.

## Signatures

```ts
assertNotNull(value: Nullable<T>, caller: AnyCaller = assertNotNull): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullable<T>` | The value to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertNotNull`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` | Nothing; narrows `value` to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is `null`. |

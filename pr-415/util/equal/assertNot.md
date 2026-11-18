# assertNot()

- Kind: function
- Import: `import { assertNot } from "shelving/util/equal";`

Assert that two values are not equal, narrowing `left` to exclude the type of `right`.

## Signatures

```ts
assertNot(left: T | N, right: N, caller: AnyCaller = assertNot): asserts left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `T \| N` | The value to check and narrow. |
| `right` | `N` | The value `left` must not equal. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertNot`). Defaults to `assertNot`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts left is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the values are equal. |

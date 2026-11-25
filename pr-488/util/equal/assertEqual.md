# assertEqual()

- Kind: function
- Import: `import { assertEqual } from "shelving/util/equal";`

Assert that two values are exactly (referentially) equal, narrowing `left` to the type of `right`.

## Signatures

```ts
assertEqual(left: unknown, right: T, caller: AnyCaller = assertEqual): asserts left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value `left` must equal. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertEqual`). Defaults to `assertEqual`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts left is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the values are not equal. |

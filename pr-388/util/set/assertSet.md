# assertSet()

- Kind: function
- Import: `import { assertSet } from "shelving/util/set";`

Assert that a value is a `Set` instance.

## Signatures

```ts
assertSet(value: unknown, caller: AnyCaller = assertSet): asserts value is ImmutableSet
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert on. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertSet`). Defaults to `assertSet`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableSet` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `Set` instance. |

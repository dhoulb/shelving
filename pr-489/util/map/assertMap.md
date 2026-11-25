# assertMap()

- Kind: function
- Import: `import { assertMap } from "shelving/util/map";`

Assert that a value is a `Map` instance.

## Signatures

```ts
assertMap(value: unknown, caller: AnyCaller = assertMap): asserts value is ImmutableMap
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertMap`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableMap` | Nothing; narrows `value` to `ImmutableMap`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `Map` instance. |

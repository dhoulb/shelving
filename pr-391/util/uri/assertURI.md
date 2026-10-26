# assertURI()

- Kind: function
- Import: `import { assertURI } from "shelving/util/uri";`

Assert that an unknown value is a URI object.

## Signatures

```ts
assertURI(value: unknown, caller: AnyCaller = assertURI): asserts value is ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertURI` itself). Defaults to `assertURI`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableURI` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a URI object. |

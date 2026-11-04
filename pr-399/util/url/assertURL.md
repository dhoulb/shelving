# assertURL()

- Kind: function
- Import: `import { assertURL } from "shelving/util/url";`

Assert that an unknown value is a URL object.

## Signatures

```ts
assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is ImmutableURL
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Unknown value to test. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to — defaults to `assertURL`. Defaults to `assertURL`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableURL` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If `value` is not a true `scheme://host` URL object. |

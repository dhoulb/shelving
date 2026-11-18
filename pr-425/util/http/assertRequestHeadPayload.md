# assertRequestHeadPayload()

- Kind: function
- Import: `import { assertRequestHeadPayload } from "shelving/util/http";`

Assert that the payload for a `HEAD` or `GET` method is a data object, `null`, or `undefined`.

## Signatures

```ts
assertRequestHeadPayload(payload: unknown, method: RequestHeadMethod, caller: AnyCaller = assertRequestHeadPayload): asserts payload is Nullish<Data>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `payload` | `unknown` | The payload to assert. |
| `method` | `RequestHeadMethod` | The HTTP method the payload is for (used in the error message). |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertRequestHeadPayload`). Defaults to `assertRequestHeadPayload`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts payload is Nullish<Data>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `payload` is not a data object, `null`, or `undefined`. |

## Examples

```ts
assertRequestHeadPayload({ q: "abc" }, "GET"); // passes
```

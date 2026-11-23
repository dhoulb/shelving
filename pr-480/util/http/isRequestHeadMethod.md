# isRequestHeadMethod()

- Kind: function
- Import: `import { isRequestHeadMethod } from "shelving/util/http";`

Is a string a supported HTTP request method that never sends a body?

## Signatures

```ts
isRequestHeadMethod(method: string): method is RequestHeadMethod
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `string` | The method string to test. |

## Returns

| Type | Description |
| --- | --- |
| `method is RequestHeadMethod` | `true` if `method` is a supported `RequestHeadMethod`, narrowing its type. |

## Examples

```ts
isRequestHeadMethod("GET") // true
```

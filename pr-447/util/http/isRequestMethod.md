# isRequestMethod()

- Kind: function
- Import: `import { isRequestMethod } from "shelving/util/http";`

Is a string a supported HTTP request method?

## Signatures

```ts
isRequestMethod(method: string): method is RequestMethod
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `string` | The method string to test. |

## Returns

| Type | Description |
| --- | --- |
| `method is RequestMethod` | `true` if `method` is a supported `RequestMethod`, narrowing its type. |

## Examples

```ts
isRequestMethod("GET") // true
```

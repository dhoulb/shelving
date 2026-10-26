# handleEndpoints()

- Kind: function
- Import: `import { handleEndpoints } from "shelving/api";`

Handle a `Request` with the first matching endpoint handler after stripping any base-path prefix from the request pathname.
- The original `Request` object is passed through to the callback unchanged.
- Path params and query params are merged before payload validation.

## Signatures

```ts
handleEndpoints(base: PossibleURL, handlers: EndpointHandlers<C>, request: Request, context: C, caller?: AnyCaller): Promise<Response>
handleEndpoints(base: PossibleURL, handlers: EndpointHandlers<void>, request: Request, context?: undefined, caller?: AnyCaller): Promise<Response>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base` | `PossibleURL` | The base URL for the API, e.g. `https://myapi.com/a/b` - `pathname` of this URL gets trimmed from `request.path` to form the target path when matching against endpoints, e.g. `/a/b/c/d` will produce `/c/d` for matching. |
| `handlers` | `EndpointHandlers<C>` | The iterable of `EndpointHandler` objects to match the request against, in order. |
| `request` | `Request` | The input request to handle. |
| `context` | `C` | The additional context value passed through to the matched handler's callback. |
| `caller` | `AnyCaller` | The function to attribute thrown errors to (defaults to this function). Optional. |
| `base` | `PossibleURL` |  |
| `handlers` | `EndpointHandlers<void>` |  |
| `request` | `Request` |  |
| `context` | `undefined` | Optional. |
| `caller` | `AnyCaller` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<Response>` | A promise resolving to the `Response` produced by the matching handler. |
| `Promise<Response>` |  |

## Throws

| Type | Description |
| --- | --- |
| `MethodNotAllowedError` | if the request method is not a supported HTTP method. |
| `NotFoundError` | if no base path matches, or no endpoint matches the target path. |

## Examples

```ts
await handleEndpoints("https://myapi.com", [getUser.handler(loadUser)], request, undefined)
```

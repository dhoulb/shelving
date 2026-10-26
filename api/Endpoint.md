# Endpoint

- Kind: class
- Import: `import { Endpoint } from "shelving/api";`

A typed API resource definition pairing a method and path with payload and result schemas.
- Acts as the contract both ends of an API agree on: providers render requests from it, handlers validate against it.
- Path may contain `{placeholder}` segments that are filled from the payload at request time.

## Signatures

```ts
new Endpoint<P, R>(method: RequestMethod, path: AbsolutePath, payload: Schema<P>, result: Schema<R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestMethod` |  |
| `path` | `AbsolutePath` |  |
| `payload` | `Schema<P>` |  |
| `result` | `Schema<R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Endpoint<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `method` | `RequestMethod` | The HTTP method this endpoint responds to, e.g. `GET` Read only. |
| `path` | `AbsolutePath` | Endpoint path, possibly including placeholders e.g. `/users/{id}` Read only. |
| `placeholders` | `TemplatePlaceholders` | The `{placeholder}` segments extracted from `path`, used to render and match URLs. Read only. |
| `payload` | `Schema<P>` | The `Schema` that request payloads are validated against. Read only. |
| `result` | `Schema<R>` | The `Schema` that response results are validated against. Read only. |

## Examples

```ts
const getUser = new Endpoint("GET", "/users/{id}", USER_PAYLOAD, USER_RESULT);
```

## Methods

- [renderPath](Endpoint/renderPath.md): Render the path for this endpoint with the given payload.
- [match](Endpoint/match.md): Match a method/path pair against this endpoint and return any matched {placeholder} params.
- [handler](Endpoint/handler.md): Create an endpoint handler pairing for this endpoint.
- [toString](Endpoint/toString.md): Convert this endpoint to a string in METHOD /path form, e.g. GET /user/{id}

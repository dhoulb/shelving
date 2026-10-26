# GET()

- Kind: function
- Import: `import { GET } from "shelving/api";`

Define a `GET` endpoint at a path, with validated payload and result types.
- "The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content."

*Factory for `Endpoint`.*

## Signatures

```ts
GET(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>
GET(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>
GET(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath` | The endpoint path, possibly including `{placeholders}` |
| `payload` | `Schema<P>` | An optional `Schema` validating the request payload. Optional. |
| `result` | `Schema<R>` | An optional `Schema` validating the response result. Optional. |
| `path` | `AbsolutePath` |  |
| `payload` | `Schema<P>` |  |
| `payload` | `undefined` |  |
| `result` | `Schema<R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Endpoint<P, R>` | An `Endpoint` configured for the `GET` method. |
| `Endpoint<P, undefined>` |  |
| `Endpoint<undefined, R>` |  |

## Examples

```ts
GET("/users/{id}", undefined, USER)
```

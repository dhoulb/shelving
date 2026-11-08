# POST()

- Kind: function
- Import: `import { POST } from "shelving/api";`

Define a `POST` endpoint at a path, with validated payload and result types.
- "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server."

*Factory for `Endpoint`.*

## Signatures

```ts
POST(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>
POST(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>
POST(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>
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
| `Endpoint<P, R>` | An `Endpoint` configured for the `POST` method. |
| `Endpoint<P, undefined>` |  |
| `Endpoint<undefined, R>` |  |

## Examples

```ts
POST("/users", USER, USER_RESULT)
```

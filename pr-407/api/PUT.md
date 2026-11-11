# PUT()

- Kind: function
- Import: `import { PUT } from "shelving/api";`

Define a `PUT` endpoint at a path, with validated payload and result types.
- "The PUT method replaces all current representations of the target resource with the request content."

*Factory for `Endpoint`.*

## Signatures

```ts
PUT(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>
PUT(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>
PUT(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>
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
| `Endpoint<P, R>` | An `Endpoint` configured for the `PUT` method. |
| `Endpoint<P, undefined>` |  |
| `Endpoint<undefined, R>` |  |

## Examples

```ts
PUT("/users/{id}", USER)
```

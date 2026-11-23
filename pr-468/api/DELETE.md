# DELETE()

- Kind: function
- Import: `import { DELETE } from "shelving/api";`

Define a `DELETE` endpoint at a path, with validated payload and result types.
- "The DELETE method deletes the specified resource."

*Factory for `Endpoint`.*

## Signatures

```ts
DELETE(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>
DELETE(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>
DELETE(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>
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
| `Endpoint<P, R>` | An `Endpoint` configured for the `DELETE` method. |
| `Endpoint<P, undefined>` |  |
| `Endpoint<undefined, R>` |  |

## Examples

```ts
DELETE("/users/{id}")
```

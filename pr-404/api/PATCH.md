# PATCH()

- Kind: function
- Import: `import { PATCH } from "shelving/api";`

Define a `PATCH` endpoint at a path, with validated payload and result types.
- "The PATCH method applies partial modifications to a resource."

*Factory for `Endpoint`.*

## Signatures

```ts
PATCH(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>
PATCH(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>
PATCH(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>
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
| `Endpoint<P, R>` | An `Endpoint` configured for the `PATCH` method. |
| `Endpoint<P, undefined>` |  |
| `Endpoint<undefined, R>` |  |

## Examples

```ts
PATCH("/users/{id}", PARTIAL_USER)
```

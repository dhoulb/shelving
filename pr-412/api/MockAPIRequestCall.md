# MockAPIRequestCall

- Kind: type
- Import: `import { MockAPIRequestCall } from "shelving/api";`

Record of a single request build, capturing the endpoint, payload, options, and built request.

## Signatures

```ts
{
	readonly endpoint: AnyEndpoint;
	readonly payload: unknown;
	readonly options: RequestOptions | undefined;
	readonly request: Request;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `endpoint` | `AnyEndpoint` | Read only. |
| `payload` | `unknown` | Read only. |
| `options` | `RequestOptions \| undefined` | Read only. |
| `request` | `Request` | Read only. |

## Types

- [AnyEndpoint](AnyEndpoint.md): An Endpoint with any payload and result type, for use where the specific types don't matter.
- [RequestOptions](../util/http/RequestOptions.md): Configurable options for endpoint requests.
- `Request`

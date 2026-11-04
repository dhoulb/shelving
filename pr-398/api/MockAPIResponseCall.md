# MockAPIResponseCall

- Kind: type
- Import: `import { MockAPIResponseCall } from "shelving/api";`

Record of a single response parse, capturing the endpoint, response, and parsed result.

## Signatures

```ts
{
	readonly endpoint: AnyEndpoint;
	readonly response: Response;
	readonly result: unknown;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `endpoint` | `AnyEndpoint` | Read only. |
| `response` | `Response` | Read only. |
| `result` | `unknown` | Read only. |

## Types

- [AnyEndpoint](AnyEndpoint.md): An Endpoint with any payload and result type, for use where the specific types don't matter.
- `Response`

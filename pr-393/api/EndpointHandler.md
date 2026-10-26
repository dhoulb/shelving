# EndpointHandler

- Kind: interface
- Import: `import { EndpointHandler } from "shelving/api";`

A typed endpoint definition paired with its implementation callback.
- Created with `Endpoint.handler()`; matched and invoked by `handleEndpoints()`.

## Signatures

```ts
{
	readonly endpoint: Endpoint<P, R>;
	readonly callback: EndpointCallback<P, R, C>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `endpoint` | `Endpoint<P, R>` | Read only. |
| `callback` | `EndpointCallback<P, R, C>` | Read only. |

# EndpointStore

- Kind: class
- Import: `import { EndpointStore } from "shelving/api";`
- Extends: `PayloadFetchStore<P, R>`

Store that loads and tracks the result of calling a single API endpoint with a fixed payload, through an `APIProvider`.

## Signatures

```ts
new EndpointStore<P, R>(endpoint: Endpoint<P, R>, payload: P, provider: APIProvider<P, R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `endpoint` | `Endpoint<P, R>` |  |
| `payload` | `P` |  |
| `provider` | `APIProvider<P, R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `EndpointStore<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `APIProvider<P, R>` | The API provider this store calls the endpoint through. Read only. |
| `endpoint` | `Endpoint<P, R>` | The endpoint this store calls to fetch its result. Read only. |

## Examples

```ts
const store = new EndpointStore(endpoint, payload, provider);
 const result = await store; // R
```

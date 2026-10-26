# APIContext

- Kind: interface
- Import: `import { APIContext } from "shelving/react";`

Bundle of hooks and a provider component returned by `createAPIContext()`

## Signatures

```ts
{
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Endpoint<PP, RR>, payload: PP): EndpointStore<PP, RR>;
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined;
	readonly APIContext: (props: ChildProps) => ReactElement;
	requireAPICache(): APICache<P, R>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `APIContext` | `(props: ChildProps) => ReactElement` | Create a new `APICache` and provide it as context to child nodes, to allow them to use `useAPI()` Read only. |

## Methods

- [useAPI](APIContext/useAPI.md): React hook to return an EndpointStore for the specified endpoint/payload in the current APIProvider context.
- [requireAPICache](APIContext/requireAPICache.md): Return the underlying APICache for <APIContext>

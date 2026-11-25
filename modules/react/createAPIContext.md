# createAPIContext

Create a React context for a Shelving `shelving/api` provider. Call `createAPIContext(provider)` once, outside any component, to produce an `<APIContext>` wrapper component and a `useAPI` hook. Each mounted `<APIContext>` gets its own in-memory `APICache`, so independent subtrees can use independent providers.

## Usage

Wrap your tree in the context component and call `useAPI(endpoint, payload)` wherever you need data. `useAPI` returns an `EndpointStore`; read `.value` to get the response — the component suspends while loading and surfaces errors to the nearest error boundary.

```tsx
import { Suspense } from "react";
import { ClientAPIProvider, ValidationAPIProvider, GET } from "shelving/api";
import { createAPIContext } from "shelving/react";
import { STRING, DATA } from "shelving/schema";

const UserSchema = DATA({ id: STRING, name: STRING });
const getUser = GET("/users/{id}", { id: STRING }, UserSchema);

const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }));
const { APIContext, useAPI } = createAPIContext(provider);

function UserCard({ id }: { id: string }) {
	const store = useAPI(getUser, { id }); // Returns an EndpointStore; component suspends while loading.
	const user = store.value;
	return <div>{user.name}</div>;
}

function App() {
	return (
		<APIContext>
			<ErrorBoundary fallback={<p>Error</p>}>
				<Suspense fallback={<p>Loading...</p>}>
					<UserCard id="u_123" />
				</Suspense>
			</ErrorBoundary>
		</APIContext>
	);
}
```

`useAPI` accepts a nullish endpoint — passing `undefined` returns `undefined` instead of a store, which keeps the hook call unconditional. Calling `useAPI` outside an `<APIContext>` throws a `RequiredError`.

## One provider per tree

Leave out the provider when you call `createAPIContext()`, and give each `<APIContext>` its own with the `provider` prop. Then each tree has its own API client, for example one per server render or one per signed-in session. The context makes an `APICache` for the provider, and a new one when the provider changes (it does not dispose the old one).

```tsx
const { APIContext, useAPI } = createAPIContext();

function Root({ api }: { api: APIProvider }) {
	return <APIContext provider={api}>{/* … */}</APIContext>;
}
```

To use an `APICache` you made yourself, for example so code outside React can invalidate its results, pass it as the `cache` prop. A `cache` prop wins over `provider`. With no `cache`, no `provider` prop and no provider given to `createAPIContext()`, `<APIContext>` throws a `RequiredError`.

# createAPIContext

Create a React context for a Shelving [API](/api) provider. Call `createAPIContext(provider)` once, outside any component, to produce an `<APIContext>` wrapper component and a `useAPI` hook. Each mounted `<APIContext>` gets its own in-memory [`APICache`](/api/APICache), so independent subtrees can use independent providers.

## Usage

Wrap your tree in the context component and call `useAPI(endpoint, payload)` wherever you need data. `useAPI` returns an [`EndpointStore`](/api/EndpointStore); read `.value` to get the response — the component suspends while loading and surfaces errors to the nearest error boundary.

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

`useAPI` accepts a nullish endpoint — passing `undefined` returns `undefined` instead of a store, which keeps the hook call unconditional. Calling `useAPI` outside an `<APIContext>` throws a [`RequiredError`](/error/RequiredError).

## See also

- [`createDBContext()`](/react/createDBContext) — the same pattern for a database provider.
- [api](/api) — [`APIProvider`](/api/APIProvider), [`APICache`](/api/APICache), [`Endpoint`](/api/Endpoint), and [`EndpointStore`](/api/EndpointStore).
- [react](/react) — overview of all React hooks and context helpers.

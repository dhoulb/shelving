# react

React hooks and context helpers for integrating Shelving [stores](../store/README.md), async sequences, and API/DB providers into React components. The module is built on `useSyncExternalStore` and standard React patterns — no magic, no global state.

## Concepts

### Stores and Suspense

`Store.value` implements the React Suspense contract directly: it throws a `Promise` while the store is loading (which Suspense catches and shows the fallback) and throws the error reason if the store has failed (which an error boundary catches). `useStore(store)` wires a store into `useSyncExternalStore` so the component re-renders whenever the store emits a new value.

### Context helpers

`createAPIContext(provider)` and `createDBContext(provider)` are factory functions that return a React context component plus typed hooks. Each mounted context instance gets its own in-memory cache, so multiple subtrees can use independent providers. This mirrors the `createDataContext` / `createCacheContext` pattern used throughout the library.

### Stable references

A recurring React problem is stale closures and unnecessary re-renders caused by objects being recreated on every render. `useProps`, `useInstance`, `useLazy`, and `useReduce` each solve a specific variant of this: `useProps` gives you a single mutable object that lives for the lifetime of the component; `useInstance` memoises a class constructor call; `useLazy` memoises an arbitrary factory call; `useReduce` lets you fold render state with custom equality logic.

## Usage

### `useStore` with Suspense

`useStore` subscribes to a store and returns it. The component suspends while the store is loading and surfaces errors to the nearest error boundary.

```tsx
import { Suspense } from "react";
import { useStore } from "@shelving/shelving/react";

function UserCard({ store }: { store: Store<User> }) {
  useStore(store); // Subscribe — re-renders when the store updates.
  const user = store.value; // Throws Promise (loading) or reason (error).
  return <div>{user.name}</div>;
}

function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <UserCard store={userStore} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### `createAPIContext`

Call `createAPIContext(provider)` once (outside any component) to produce a context component and a `useAPI` hook. Wrap your tree in the context component and call `useAPI` wherever you need data.

```tsx
import { APIProvider, ValidationAPIProvider, GET } from "@shelving/shelving/api";
import { createAPIContext } from "@shelving/shelving/react";
import { STRING, DATA } from "@shelving/shelving/schema";

const UserSchema = DATA({ id: STRING, name: STRING });
const getUser = GET("/users/{id}", { id: STRING }, UserSchema);

const provider = new ValidationAPIProvider(new APIProvider({ url: "https://api.example.com" }));
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

`useAPI` accepts an optional `maxAge` (milliseconds, default 5 minutes). If the cached response is older than `maxAge`, a background re-fetch is triggered automatically.

### `createDBContext`

The DB equivalent works the same way but exposes `useItem` and `useQuery` hooks:

```tsx
import { createDBContext } from "@shelving/shelving/react";

const { DBContext, useItem, useQuery } = createDBContext(dbProvider);

function UserCard({ id }: { id: string }) {
  const store = useItem(Users, id); // ItemStore — suspends while loading.
  const user = store.value;
  return <div>{user.name}</div>;
}

function UserList() {
  const store = useQuery(Users, { $order: "name" }); // QueryStore.
  const users = store.value;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### `useInstance`

Creates a stable class instance. A new instance is only constructed when the arguments change (by deep equality). Useful for creating stores or caches inside a component without moving them to module scope.

```tsx
import { useInstance } from "@shelving/shelving/react";
import { APICache } from "@shelving/shelving/api";

function MyComponent({ provider }: { provider: APIProvider }) {
  const cache = useInstance(APICache, provider); // Stable across renders.
  // ...
}
```

### `useSequence`

Subscribes to an `AsyncIterable` for the lifetime of the component and returns the most recent value. The subscription is recreated whenever the iterable reference changes, so memoising the iterable keeps it stable.

```tsx
import { useSequence } from "@shelving/shelving/react";

function LiveCounter({ counter }: { counter: AsyncIterable<number> }) {
  const count = useSequence(counter); // undefined until first emission.
  return <span>{count ?? "—"}</span>;
}
```

### `useLazy` and `useReduce`

`useLazy` computes a value once and recomputes only when its arguments change:

```tsx
const sorted = useLazy((items) => [...items].sort(), items);
```

`useReduce` runs a reducer on every render, receiving the previous return value so you can implement custom memoisation:

```tsx
const stable = useReduce((prev, next) => {
  if (prev && isDeepEqual(prev, next)) return prev; // Preserve reference if equal.
  return next;
}, incoming);
```

## See also

- [store](../store/README.md) — the `Store` class that `useStore` subscribes to
- [api](../api/README.md) — `APIProvider`, `APICache`, and `EndpointStore`
- [db](../db/README.md) — `DBProvider`, `DBCache`, `ItemStore`, and `QueryStore`

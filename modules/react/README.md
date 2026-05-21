# react

React hooks and context helpers for integrating Shelving [stores](/store), async sequences, and API/DB providers into React components. The module is built on `useSyncExternalStore` and standard React patterns — no magic, no global state.

## Concepts

### Stores and Suspense

`Store.value` implements the React Suspense contract directly: it throws a `Promise` while the store is loading (which Suspense catches and shows the fallback) and throws the error reason if the store has failed (which an error boundary catches). `useStore(store)` wires a store into `useSyncExternalStore` so the component re-renders whenever the store emits a new value.

### Context helpers

`createAPIContext(provider)` and `createDBContext(provider)` are factory functions that return a React context component plus typed hooks. Each mounted context instance gets its own in-memory cache, so multiple subtrees can use independent providers. This mirrors the `createDataContext` / `createCacheContext` pattern used throughout the library.

### Stable references

A recurring React problem is stale closures and unnecessary re-renders caused by objects being recreated on every render. `useInstance`, `useLazy`, `useReduce`, and `useMap` each solve a specific variant of this: `useInstance` memoises a class constructor call; `useLazy` memoises an arbitrary factory call; `useReduce` lets you fold render state with custom equality logic; `useMap` gives you a single mutable `Map` that lives for the lifetime of the component.

## Usage

The per-symbol pages below carry the detailed usage for each hook and context factory. This section shows how the pieces fit together for real tasks — start here, then follow the links for specifics.

### Rendering data with a DB context

Create a context once at module scope, wrap the tree in it, and let child components suspend while data loads. The same shape works for `createAPIContext` — swap `useItem` / `useQuery` for `useAPI`.

```tsx
import { Suspense } from "react";
import { createDBContext } from "shelving/react";

const { DBContext, useItem, useQuery } = createDBContext(dbProvider);

function UserCard({ id }: { id: string }) {
  const user = useItem(Users, id).value; // Suspends while loading.
  return <li>{user.name}</li>;
}

function UserList() {
  const users = useQuery(Users, { $order: "name" }).value;
  return <ul>{users.map(u => <UserCard key={u.id} id={u.id} />)}</ul>;
}

function App() {
  return (
    <DBContext>
      <ErrorBoundary fallback={<p>Something went wrong.</p>}>
        <Suspense fallback={<p>Loading…</p>}>
          <UserList />
        </Suspense>
      </ErrorBoundary>
    </DBContext>
  );
}
```

### Building a store inside a component

A store that depends on props can't live at module scope. `useInstance` constructs it once and keeps it stable across renders, while `useStore` subscribes the component to its updates.

```tsx
import { useInstance, useStore } from "shelving/react";
import { BooleanStore } from "shelving/store";

function Toggle() {
  const open = useInstance(BooleanStore); // Created once, stable across renders.
  useStore(open); // Re-render whenever the store changes.
  return <button onClick={() => open.toggle()}>{open.value ? "Open" : "Closed"}</button>;
}
```

## See also

- [store](/store) — the `Store` class that `useStore` subscribes to
- [api](/api) — `APIProvider`, `APICache`, and `EndpointStore`
- [db](/db) — `DBProvider`, `DBCache`, `ItemStore`, and `QueryStore`

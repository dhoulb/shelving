# useStore()

- Kind: function
- Import: `import { useStore } from "shelving/react";`

Subscribe to a Shelving `Store` instance to refresh this component when its value changes.
- Re-renders the component whenever the store's value changes for as long as it is mounted.
- Pass `undefined` to subscribe to nothing (e.g. for conditional subscriptions).

Subscribe a component to a Shelving `shelving/store` so it re-renders whenever the store emits a new value. The store is wired into React's `useSyncExternalStore`, and `useStore` returns the same store it was given.

`useStore` only handles the subscription. To read the value, use `store.value` — which throws a `Promise` while the store is loading (caught by `<Suspense>`) and throws the error reason if the store has failed (caught by an error boundary).

## Usage

`useStore` subscribes to a store and returns it. The component suspends while the store is loading and surfaces errors to the nearest error boundary.

```tsx
import { Suspense } from "react";
import { useStore } from "shelving/react";

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

The argument is optional — passing `undefined` is allowed (the hook is still called unconditionally, satisfying the rules of hooks) and returns `undefined`.


## Signatures

```ts
useStore(store: T): T
useStore(store?: T | undefined): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `store` | `T` | `Store` instance to subscribe to, or `undefined` to subscribe to nothing. |
| `store` | `T \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `T` |  |
| `T \| undefined` |  |

# useStore

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

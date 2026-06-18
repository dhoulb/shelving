# createDBContext

Create a React context for a Shelving [`shelving/db`](/db) provider. Call `createDBContext(provider)` once, outside any component, to produce a `<DBContext>` wrapper component plus `useItem` and `useQuery` hooks. Each mounted `<DBContext>` gets its own in-memory [`DBCache`](/db/DBCache); if the provider chain includes a [`CacheDBProvider`](/db/CacheDBProvider), the returned stores reuse that cached data.

## Usage

Wrap your tree in the context component, then call `useItem` for a single document or `useQuery` for a collection query. Both return a store ([`ItemStore`](/db/ItemStore) / [`QueryStore`](/db/QueryStore)); read `.value` to get the data — the component suspends while loading.

```tsx
import { Suspense } from "react";
import { createDBContext } from "shelving/react";

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

function App() {
  return (
    <DBContext>
      <ErrorBoundary fallback={<p>Error</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <UserList />
        </Suspense>
      </ErrorBoundary>
    </DBContext>
  );
}
```

Both hooks accept nullish arguments — passing `undefined` for the collection, id, or query returns `undefined` instead of a store, keeping the hook call unconditional. Calling either hook outside a `<DBContext>` throws a [`RequiredError`](/error/RequiredError).

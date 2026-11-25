# createDBContext()

- Kind: function
- Import: `import { createDBContext } from "shelving/react";`

Create a data context
- Allows React elements to call `useItem()` and `useQuery()` to access items/queries in a database provider.
- The provider can be given here, or to each `<DBContext>` as its `provider` or `cache` prop, so each tree can have its own database.
- If the database is (or wraps) a `MemoryDBProvider`, the returned stores seed from it synchronously.

Create a React context for a Shelving `shelving/db` provider. Call `createDBContext(provider)` once, outside any component, to produce a `<DBContext>` wrapper component plus `useItem` and `useQuery` hooks. Each mounted `<DBContext>` gets its own in-memory `DBCache`; if the provider is (or wraps) a `MemoryDBProvider`, the returned stores seed from it synchronously.

## Usage

Wrap your tree in the context component, then call `useItem` for a single document or `useQuery` for a collection query. Both return a store (`ItemStore` / `QueryStore`); read `.value` to get the data — the component suspends while loading.

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
	return (
		<ul>
			{users.map(u => (
				<li key={u.id}>{u.name}</li>
			))}
		</ul>
	);
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

Both hooks accept nullish arguments — passing `undefined` for the collection, id, or query returns `undefined` instead of a store, keeping the hook call unconditional. Calling either hook outside a `<DBContext>` throws a `RequiredError`.

## One provider per tree

Leave out the provider when you call `createDBContext()`, and give each `<DBContext>` its own with the `provider` prop. Then each tree has its own database, for example one per server render or one per signed-in session. The context makes a `DBCache` for the provider, and a new one when the provider changes (it does not dispose the old one).

```tsx
const { DBContext, useItem } = createDBContext<string, Data>();

function Root({ db }: { db: MemoryDBProvider<string, Data> }) {
	return <DBContext provider={db}>{/* … */}</DBContext>;
}
```

To use a `DBCache` you made yourself, for example to read it outside React, pass it as the `cache` prop. A `cache` prop wins over `provider`. With no `cache`, no `provider` prop and no provider given to `createDBContext()`, `<DBContext>` throws a `RequiredError`.


## Signatures

```ts
createDBContext(provider?: DBProvider<I, T>): DBContext<I, T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I, T>` | Default `DBProvider` the created context resolves item and query stores against, when a `<DBContext>` gets no `provider` or `cache` prop. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `DBContext<I, T>` |  |

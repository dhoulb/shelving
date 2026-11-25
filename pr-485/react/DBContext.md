# DBContext

- Kind: interface
- Import: `import { DBContext } from "shelving/react";`

Bundle of hooks and a provider component returned by `createDBContext()`.

## Signatures

```ts
{
	useItem<II extends I, TT extends T>(
		collection: Nullish<Collection<string, II, TT>>, //
		id: Nullish<II>,
	): ItemStore<II, TT> | undefined;
	useItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>, //
		id: II,
	): ItemStore<II, TT>;
	useQuery<II extends I, TT extends T>(
		collection: Nullish<Collection<string, II, TT>>, //
		query: Nullish<Query<Item<II, TT>>>,
	): QueryStore<II, TT> | undefined;
	useQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>, //
		query: Query<Item<II, TT>>,
	): QueryStore<II, TT>;
	readonly DBContext: (props: DBContextProps<I, T>) => ReactElement;
	requireDBCache(): DBCache<I, T>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `DBContext` | `(props: DBContextProps<I, T>) => ReactElement` | Provide a `DBCache` as context to child nodes, to allow them to use `useItem()` and `useQuery()` Read only. |

## Methods

- [DBContext.useItem()](DBContext/useItem.md): Get an ItemStore for the specified collection item in the current DataProvider context and subscribe to any changes in it.
- [DBContext.useQuery()](DBContext/useQuery.md): Get an QueryStore for the specified collection query in the current DataProvider context and subscribe to any changes in it.
- [DBContext.requireDBCache()](DBContext/requireDBCache.md): Return the underlying DBCache for <DBContext>

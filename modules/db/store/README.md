# Stores

`ItemStore` and `QueryStore` are reactive, database-backed stores. Each one holds the current value of a single item or query result and re-fetches from the provider when asked. They integrate with React Suspense — reading `.value` while loading throws a `Promise` that Suspense catches.

Both extend `FetchStore` from the `shelving/store` module, which manages the loading / error / ready lifecycle and the `refresh(maxAge?)` method.

## Concepts

### ItemStore

`ItemStore<I, T>` holds `OptionalItem<I, T>` — the current item, or `undefined` if it does not exist. It calls `DBProvider.getItem()` on the first fetch and whenever `refresh()` is called.

- `ItemStore.item` — returns the item or throws `RequiredError` if absent. Safe to use once the store is loaded and you know the item exists.
- `.item = data` — write helper that sets `.value` to `getItem()` directly (bypasses the provider; useful for optimistic updates).

When a `MemoryDBProvider` is supplied (via `DBCache` reusing the `CacheDBProvider` mirror), the store seeds its initial value from the in-memory snapshot and subscribes to live changes via `DBProvider.getItemSequence()`. This makes the first render synchronous if the data is already cached.

### QueryStore

`QueryStore<I, T>` holds `Items<I, T>` — a readonly array of matching items. It calls `DBProvider.getQuery()` on the first fetch. Like `ItemStore`, it seeds from memory when available.

Additional accessors beyond the base `FetchStore`:

- `QueryStore.first` / `QueryStore.last` — the first or last item; throw `RequiredError` if the result is empty.
- `QueryStore.optionalFirst` / `QueryStore.optionalLast` — same, returning `undefined` instead of throwing.
- `QueryStore.limit` — the `$limit` from the query (the page size), or `Infinity` if not set.
- `[Symbol.iterator]` — `QueryStore` is directly iterable, so `for...of store` works.

### Paged queries

A query with an `$order` loads in pages, and the query `$limit` is the page size.

- `QueryStore.fetchAfter()` loads the next page after the last item. `QueryStore.hasAfter` is `false` when there are no more items. `QueryStore.fetchMore()` and `QueryStore.hasMore` are aliases.
- `QueryStore.fetchBefore()` loads the new items before the first item, e.g. new messages in a newest-first chat. Call it on a timer to poll. `QueryStore.hasBefore` is `true` when there were more new items than one page.
- `QueryStore.paging` is `true` while a page loads. The items already loaded do not suspend.
- `QueryStore.refresh()` loads every loaded page again in one query, so the store keeps its pages.

A paged store **pins** its items. After a fetch, each item keeps its position:

- An edit to an item shows in place. The item does not move or leave the list, even if its sort value or a filter match changes. A refresh puts it in its new position.
- An item deleted from the memory is hidden. If the delete is undone, the item shows again in its old position.
- A new item in the memory that matches the filters and sorts before the first item shows at the start at once. This is how an optimistic preview from `UndoDBProvider` shows in the list.
- A new item that sorts between loaded items shows only after a refresh.

The cursor is an inclusive range on the first `$order` key (see `getAfterQuery()`). The store drops the items it already has by ID, so no item is skipped or shown twice. Page on a first key with many distinct values, e.g. a timestamp: many items with the same value make each page read them all again.

A query without an `$order` does not page. It follows the live query result in the memory.

## Usage

### Direct instantiation

You do not usually create these stores directly. `DBCache` manages them so only one store exists per (collection, id-or-query). Direct use is shown here for clarity.

```ts
import { ItemStore, QueryStore } from "shelving/db";

const itemStore = new ItemStore(POSTS, "abc", provider);
await itemStore.refresh();        // Fetches from provider.
console.log(itemStore.value);     // { id: "abc", title: "…", … } or undefined

const queryStore = new QueryStore(POSTS, { published: true, $order: "title" }, provider);
await queryStore.refresh();
for (const post of queryStore) {
  console.log(post.id, post.title);
}
```

### With a memory cache (synchronous first render)

```ts
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider, DBCache } from "shelving/db";

const memory = new MemoryDBProvider();
const provider = new CacheDBProvider(new ValidationDBProvider(memory));
const cache = new DBCache(provider);

// After a prior fetch has populated the CacheDBProvider's mirror,
// this store starts loaded synchronously — no Suspense boundary needed.
const store = cache.getItem(POSTS, "abc");
console.log(store.loading); // false if already in cache
```

### Paging in React

```tsx
function Messages({ squad }: { squad: string }) {
  const store = useQuery(MESSAGES, { squad, $order: "!when", $limit: 50 }); // Suspends on the first page.
  const paging = useStore(store.paging).value;
  useEffect(() => {
    const timer = setInterval(() => void store.fetchBefore(), 10_000); // Poll for new messages.
    return () => clearInterval(timer);
  }, [store]);
  return (
    <>
      {store.value.map(message => <Message key={message.id} message={message} />)}
      {store.hasAfter && <Button onClick={() => void store.fetchAfter()} disabled={paging}>Show older</Button>}
    </>
  );
}
```

### React Suspense integration

In a React app, use `createDBContext()` instead of managing stores manually. The context wraps a `DBCache` and the `DBContext.useItem()` / `DBContext.useQuery()` hooks handle Suspense automatically.

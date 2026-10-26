# Stores

`ItemStore` and `QueryStore` are reactive, database-backed stores. Each one holds the current value of a single item or query result and re-fetches from the provider when asked. They integrate with React Suspense — reading `.value` while loading throws a `Promise` that Suspense catches.

Both extend `FetchStore` from the `shelving/store` module, which manages the loading / error / ready lifecycle and the `refresh(maxAge?)` method.

## Concepts

### ItemStore

`ItemStore<I, T>` holds `OptionalItem<I, T>` — the current item, or `undefined` if it does not exist. It calls `DBProvider.getItem()` on the first fetch and whenever `refresh()` is called.

- `ItemStore.item` — returns the item or throws `RequiredError` if absent. Safe to use once the store is loaded and you know the item exists.
- `.item = data` — write helper that sets `.value` to `getItem()` directly (bypasses the provider; useful for optimistic updates).

When the provider is (or wraps) a `MemoryDBProvider`, the store seeds its initial value from the memory and follows its changes. This makes the first render synchronous when the memory has the item. A missing item only counts as loaded when the memory has a time for it (`MemoryTable.getItemTime()`). Until then the store is loading, and a fetch waits until the memory loads the item (e.g. from `HydratingAPIProvider`).

For any other provider, the store fetches with `DBProvider.getItem()`, and follows `DBProvider.getItemSequence()` while it has subscribers. A provider that throws `UnsupportedError` for subscriptions is only fetched.

### QueryStore

`QueryStore<I, T>` holds `Items<I, T>` — a readonly array of matching items. It works like `ItemStore`: it seeds from and follows a memory, or fetches with `DBProvider.getQuery()` and follows `DBProvider.getQuerySequence()`. An empty result only counts as loaded when the memory has a time for the query (`MemoryTable.getQueryTime()`).

Additional accessors beyond the base `FetchStore`:

- `QueryStore.first` / `QueryStore.last` — the first or last item; throw `RequiredError` if the result is empty.
- `QueryStore.optionalFirst` / `QueryStore.optionalLast` — same, returning `undefined` instead of throwing.
- `[Symbol.iterator]` — `QueryStore` is directly iterable, so `for...of store` works.

### Paging

`QueryStore` does not page. Paging is a feature of the API: call the endpoint for the next page, and `HydratingAPIProvider` writes the items into the memory. A store over the memory shows every item that matches its query, so it shows the new items at once. Use `getQueryItemsAfter()` to get the next page's query from the last page.

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

### With a memory (synchronous first render)

```ts
import { DBCache, MemoryDBProvider } from "shelving/db";

const memory = new MemoryDBProvider();
const cache = new DBCache(memory);

// When the memory has the item (e.g. `HydratingAPIProvider` wrote it), this store starts loaded — no Suspense.
const store = cache.getItem(POSTS, "abc");
```

### Paging in React

```tsx
function Messages({ squad }: { squad: string }) {
  const messages = useQuery(MESSAGES, { squad, $order: "!when" }).value; // Every cached message, newest first.
  const first = useAPI(LIST_MESSAGES, { squad, $order: "!when", $limit: 50 }); // Loads the first page into the memory.
  const [page, setPage] = useState<QueryItems<string, MessageData>>();
  const next = getQueryItemsAfter((page ?? first.value).messages);
  return (
    <>
      {messages.map(message => <Message key={message.id} message={message} />)}
      {next && <Button onClick={async () => setPage(await API.call(LIST_MESSAGES, next))}>Show older</Button>}
    </>
  );
}
```

### React Suspense integration

In a React app, use `createDBContext()` instead of managing stores manually. The context wraps a `DBCache` and the `DBContext.useItem()` / `DBContext.useQuery()` hooks handle Suspense automatically.

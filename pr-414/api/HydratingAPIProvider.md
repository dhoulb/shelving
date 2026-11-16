# HydratingAPIProvider

- Kind: class
- Import: `import { HydratingAPIProvider } from "shelving/api";`
- Extends: `ValidationAPIProvider<P, R>`

API provider that validates every result, then writes the collection items in it into a local database.

- Only results that use a collection's own schemas hydrate: `Collection.item`, `Collection.items` and `Collection.queryItems`, or a `DataSchema` whose props use them (one level deep). Every other result passes through with no change.
- `Collection.item` sets the item. A `null` or `undefined` result (e.g. `NULLABLE(USERS.item)`) deletes the item with the `id` from the payload (the payload itself, or its `id` prop).
- `Collection.items` sets each item. It never deletes items.
- `Collection.queryItems` sets each item, then marks the query as loaded (see `MemoryTable.setQueryTime()`).
- Writes happen synchronously before `call()` resolves, so no store sees half of a result.
- Extends `ValidationAPIProvider`, so it only ever writes validated items.

A wrapping provider that validates every result, then writes the collection items in it into a local `MemoryDBProvider`. One API response can then fill the stores for several collections, and `useItem()` / `useQuery()` show the items at once.

## Things to know

- Only results that use a collection's own schemas hydrate: `Collection.item`, `Collection.items` and `Collection.queryItems`, or a `DataSchema` whose props use them (one level deep). Every other result passes through with no change.
- `ARRAY(USERS.item)` does **not** hydrate, because it does not point at the collection. Use `USERS.items`.
- A `null` or `undefined` result for `NULLABLE(USERS.item)` deletes the item with the `id` from the payload. The table then knows the item is missing, so an `ItemStore` shows it as missing and not as loading.
- `Collection.items` only adds and replaces items. It never deletes them, so an item the server dropped stays until something deletes it.
- `Collection.queryItems` also marks its query as loaded (see `MemoryTable.setQueryTime()`), so a `QueryStore` for exactly that query shows its items, or shows that it has none, without loading. The query matches by `JSON.stringify()`, so build it in one shared function for the server and the client.
- **Do not trust the `query` in a `Collection.queryItems` result.** It is only checked to be an object.
- Writes happen synchronously before `call()` resolves, so no store sees half of a result.
- It extends `ValidationAPIProvider`, so it only writes validated items.

## Usage

```ts
import { ClientAPIProvider, GET, HydratingAPIProvider } from "shelving/api";
import { COLLECTION, MemoryDBProvider } from "shelving/db";
import { DATA, NULLABLE, STRING } from "shelving/schema";

const SQUADS = COLLECTION("squads", STRING, { title: STRING });
const MEMBERS = COLLECTION("members", STRING, { squad: STRING, user: STRING });

// One response returns two collections.
const MY_SQUADS = GET("/squad/me", DATA({}), DATA({ squads: SQUADS.items, members: MEMBERS.queryItems }));
const GET_SQUAD = GET("/squad/{id}", DATA({ id: STRING }), NULLABLE(SQUADS.item));

const DB = new MemoryDBProvider();
const API = new HydratingAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }), DB);

await API.call(MY_SQUADS, {}); // Writes the squads and members into `DB`, and marks the members query as loaded.
await API.call(GET_SQUAD, { id: "reds" }); // Sets the squad, or deletes it if the result is `null`.
```

The server sends the query with the items, so the client knows which query the items answer:

```ts
// shared/query.ts — one function builds the query on the server and the client.
export const getMyMembersQuery = (user: string): Query<MemberItem> => ({ user, $order: "squad" });

// Server handler.
MY_SQUADS.handler(async (_payload, _request, { user }) => ({
  squads: await getMySquads(user),
  members: { query: getMyMembersQuery(user), items: await getMyMembers(user) },
}));
```

## Paging

Page an endpoint with `getQueryItemsAfter()`. It takes the cursor from the last page, never from the cache:

```ts
const page = await API.call(LIST_MESSAGES, { squad, $order: "!when", $limit: 30 });
const next = getQueryItemsAfter(page.messages); // `undefined` when there are no more.
if (next) await API.call(LIST_MESSAGES, next);
```


## Signatures

```ts
new HydratingAPIProvider<P, R>(source: APIProvider<P, R>, db: MemoryDBProvider)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `APIProvider<P, R>` |  |
| `db` | `MemoryDBProvider` |  |

## Returns

| Type | Description |
| --- | --- |
| `HydratingAPIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `db` | `MemoryDBProvider` | The local database the items are written into. Read only. |

# FetchStore

- Kind: class
- Import: `import { FetchStore } from "shelving/store";`
- Extends: `BusyStore<T, TT>`

Store that fetches its values from a remote source on demand.
- Reading `value` or `loading` optimistically triggers a fetch so the value is available next time.
- Fetches are de-duplicated, can be aged out with `maxAge`, and can be forced stale with `invalidate()`.
- Provide a `callback` to fetch values, or subclass and override `this._fetch()` for custom behaviour.

A `Store` that fetches its value from a callback. `FetchStore<T>` calls its callback to produce a value, tracks staleness, and re-fetches on demand. Reading `.value` or `.loading` triggers the initial fetch automatically, and concurrent fetches are de-duplicated — only one runs at a time.

It is the base class for the API and database stores (`EndpointStore`, `ItemStore`, `QueryStore`).

## Usage

Pass an initial value (or `NONE`) and a callback. The callback receives an `AbortSignal` it can pass to `fetch()` so a superseded request is cancelled:

```ts
import { FetchStore, NONE } from "shelving/store";

const store = new FetchStore<User>(NONE, async (signal) => {
  const res = await fetch("/api/me", { signal });
  return res.json();
});

console.log(store.loading);    // true — reading this triggered the fetch
const user = await store.next; // wait for the first value

store.invalidate();            // mark stale; the next read re-fetches
await store.refresh();         // re-fetch now
```

`refresh(maxAge)` accepts a max age in milliseconds: the exported `ALWAYS_REFRESH` (`0`, the default) always re-fetches, while `AVOID_REFRESH` (`Infinity`) only fetches if the store has no value yet.


## Signatures

```ts
new FetchStore<T, TT>(value: T | typeof NONE, callback?: FetchCallback<TT>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `T \| typeof NONE` |  |
| `callback` | `FetchCallback<TT>` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `FetchStore<T, TT>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `signal` | `AbortSignal` | Current `AbortSignal` for this store's in-flight fetch. - Created lazily; a new signal is issued each time `refresh()` starts a new fetch or `abort()` is called. - Reading this triggers `abort()` so any current awaits are cancelled. Read only. |
| `invalidated` | `boolean` | Whether this store has currently been invalidated and needs a refresh. Read only. |

## Methods

- [FetchStore.refresh()](FetchStore/refresh.md): Fetch the result for this store now.
- [FetchStore.invalidate()](FetchStore/invalidate.md): Invalidate this store so a new fetch is triggered on the next read of loading or value.

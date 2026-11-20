# FetchStore

A `Store` that fetches its value from a callback. `FetchStore<T>` calls its callback to produce a value, tracks staleness, and re-fetches on demand. Reading `.value` or `.loading` triggers the initial fetch automatically, and concurrent fetches are de-duplicated — only one runs at a time.

It is the base class for the API and database stores (`EndpointStore`, `ItemStore`, `QueryStore`).

## Usage

Pass an initial value (or `NONE`) and a callback. The callback receives an `AbortSignal` it can pass to `fetch()` so a superseded request is cancelled:

```ts
import { FetchStore, NONE } from "shelving/store";

const store = new FetchStore<User>(NONE, async signal => {
	const res = await fetch("/api/me", { signal });
	return res.json();
});

console.log(store.loading); // true — reading this triggered the fetch
const user = await store.next; // wait for the first value

store.invalidate(); // mark stale; the next read re-fetches
await store.refresh(); // re-fetch now
```

`refresh(maxAge)` accepts a max age in milliseconds: the exported `ALWAYS_REFRESH` (`0`, the default) always re-fetches, while `AVOID_REFRESH` (`Infinity`) only fetches if the store has no value yet.

## Failed fetches

- A failed fetch keeps the current value, if the store has one. The page keeps showing the old value, and the next `refresh()` tries again.
- With no value, the error is saved as `reason`, and reading `value` throws it to the nearest error boundary.
- A read of `value` a second or more after the failure fetches again, and the store shows as loading. So a `<RetryButton>` in a `<Catcher>` works. A read sooner than that throws the error again, so React's own quick re-render of a failed component does not fetch in a loop.

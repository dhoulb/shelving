# PayloadFetchStore

A [`FetchStore`](/store/FetchStore) whose fetch is driven by a payload. `PayloadFetchStore<P, R>` holds an inner `.payload` store; whenever the payload changes, any in-flight fetch is cancelled and a fresh one starts with the new payload.

This is the base class for [`EndpointStore`](/api/EndpointStore) in the [`shelving/api`](/api) module — the payload is the endpoint's request payload.

## Usage

Pass an initial payload, an initial value (or [`NONE`](/util/constants/NONE)), and a callback that receives the current payload:

```ts
import { PayloadFetchStore, NONE } from "shelving/store";

const store = new PayloadFetchStore<string, User>(
  "u_1",
  NONE,
  async (id, signal) => (await fetch(`/api/users/${id}`, { signal })).json(),
);

const first = await store.next; // fetches for "u_1"

// Changing the payload cancels the previous fetch and starts a new one.
store.payload.value = "u_2";
```

Pass a fourth `debounce` argument (milliseconds) to delay the fetch after a payload change — rapid changes reset the timer, so only the final payload is fetched.

## See also

- [`FetchStore`](/store/FetchStore) — the base class.
- [`shelving/store`](/store) — overview of all store classes.
- [`shelving/api`](/api) — [`EndpointStore`](/api/EndpointStore) extends `PayloadFetchStore`.

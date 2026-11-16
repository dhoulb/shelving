# PayloadFetchStore

- Kind: class
- Import: `import { PayloadFetchStore } from "shelving/store";`
- Extends: `FetchStore<R>`

Store that fetches its values from a remote source by sending it a payload.
- Holds the current payload in a nested `this.payload` store; setting `this.payload.value` triggers a fresh fetch.
- Optionally debounces fetches so rapid payload changes only result in a single request.

A `FetchStore` whose fetch is driven by a payload. `PayloadFetchStore<P, R>` holds an inner `.payload` store; whenever the payload changes, any in-flight fetch is cancelled and a fresh one starts with the new payload.

This is the base class for `EndpointStore` in the `shelving/api` module — the payload is the endpoint's request payload.

## Usage

Pass an initial payload, an initial value (or `NONE`), and a callback that receives the current payload:

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


## Signatures

```ts
new PayloadFetchStore<P, R>(payload: P | typeof NONE, value: R | typeof NONE, callback?: PayloadFetchCallback<P, R>, debounce = 0)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `payload` | `P \| typeof NONE` |  |
| `value` | `R \| typeof NONE` |  |
| `callback` | `PayloadFetchCallback<P, R>` | Optional. |
| `debounce` | `unknown` | Defaults to `0`. |

## Returns

| Type | Description |
| --- | --- |
| `PayloadFetchStore<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `payload` | `Store<P>` | Store keeping the current payload to send to the fetch on send. - New payloads can be set using `this.payload.value` Read only. |

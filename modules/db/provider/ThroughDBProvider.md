# ThroughDBProvider

The identity pass-through base for wrapping providers. `ThroughDBProvider` takes a `source` provider and delegates every method to it. Extend it to intercept only the methods you care about — timing, metrics, access control — without reimplementing the rest.

`ValidationDBProvider`, `DebugDBProvider`, and `ChangesDBProvider` are all `ThroughDBProvider` subclasses.

## Usage

Override only the methods you need and call `super` to delegate the rest:

```ts
import { ThroughDBProvider } from "shelving/db";

class TimingDBProvider extends ThroughDBProvider {
  override async getItem(collection, id) {
    const t = performance.now();
    const result = await super.getItem(collection, id);
    console.log(`getItem took ${performance.now() - t}ms`);
    return result;
  }
}
```

## Query writes: passthrough vs two-step

A query write (`setQuery`, `updateQuery`, `deleteQuery`) can be implemented with one of two strategies:

- **Passthrough** — forward the query write to `source` in a single call, so the underlying engine executes it natively (e.g. one SQL `UPDATE … WHERE`). Wrapper behaviour applies to the operation, but not to the individual items it changes.
- **Two-step** — resolve the query to its matching items with `getQuery()`, then write each item through the wrapper's own `setItem()` / `updateItem()` / `deleteItem()`, so every implied write flows through the wrapper's overrides.

`ThroughDBProvider` defaults to two-step — the same theory as `transact()` below: a wrapper's behaviour should apply to everything that happens through it. `ChangesDBProvider` relies on this to record exactly which items a query write changed. Wrappers that don't need per-item behaviour override the query writes back to passthrough (calling `source` directly) to keep the engine's native efficiency and atomicity — `ValidationDBProvider` (validates the query write's inputs up front) and `DebugDBProvider` (logs the operation the caller made) both do this.

The per-item writes run concurrently (via `awaitValues()`, which settles every write before rejecting), so a two-step batch over a remote source costs one round-trip of latency rather than one per item — though the order the individual writes complete in (and appear in a `ChangesDBProvider` log) is not guaranteed within the batch. The resolve and the writes are separate steps, so a two-step query write is only atomic when it runs inside `transact()`.

## Transactions

`ThroughDBProvider.transact()` keeps the wrapper's behaviour inside the transaction: the callback receives a copy of the wrapping provider whose `source` is swapped for the source's transaction provider, so overridden methods (validation, timing, logging, etc.) still apply to every read and write in the callback. Subclasses get this for free — `TimingDBProvider` above times operations inside transactions without any extra code.

The copy is made by the `cloneWith()` method and shares the wrapper's prototype and state. Override `cloneWith()` if a subclass holds per-instance mutable state that must not be shared with transaction copies — `ChangesDBProvider` does this to give each transaction its own log, so only a committed transaction's writes are merged into the main `changes` log.

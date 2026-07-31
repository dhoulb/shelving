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

## Transactions

`ThroughDBProvider.transact()` keeps the wrapper's behaviour inside the transaction: the callback receives a copy of the wrapping provider whose `source` is swapped for the source's transaction provider, so overridden methods (validation, timing, logging, etc.) still apply to every read and write in the callback. Subclasses get this for free — `TimingDBProvider` above times operations inside transactions without any extra code.

The copy is made by the `cloneWith()` method and shares the wrapper's prototype and state. Override `cloneWith()` if a subclass holds per-instance mutable state that must not be shared with transaction copies — `ChangesDBProvider` does this to give each transaction its own log, so only a committed transaction's writes are merged into the main `changes` log.

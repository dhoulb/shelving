# ThroughDBProvider

The identity pass-through base for wrapping providers. `ThroughDBProvider` takes a `source` provider and delegates every method to it. Extend it to intercept only the methods you care about — timing, metrics, access control — without reimplementing the rest.

[`ValidationDBProvider`](/db/ValidationDBProvider), [`DebugDBProvider`](/db/DebugDBProvider), and [`ChangesDBProvider`](/db/ChangesDBProvider) are all `ThroughDBProvider` subclasses.

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

## See also

- [`DBProvider`](/db/DBProvider) — the abstract base.
- [db/provider](/db/provider) — overview of the provider hierarchy.

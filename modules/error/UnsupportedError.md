# UnsupportedError

Thrown when functionality is called but is not supported — a backend that can't run a type of operation (e.g. a key-value store asked to run a query), an environment missing a required capability (e.g. `localStorage` on the server), or an abstract method left for a subclass to override.

## Usage

```ts
import { UnsupportedError } from "shelving/error";

class KVProvider {
  getQuery(): Promise<Items> {
    throw new UnsupportedError("KVProvider does not support querying items");
  }
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

# Disposable helpers

Safe, aggregate disposal of resources using the TC39 `Symbol.dispose` / `Symbol.asyncDispose` protocol. When multiple disposables are cleaned up together, all of them run even if some throw — errors are collected and re-thrown as a single `Errors` aggregate.

- `dispose()` and `awaitDispose()` both accept plain callbacks as well as `Disposable` / `AsyncDisposable` objects, so you can mix cleanup styles.
- `null` and `undefined` values are silently skipped — no need to filter before passing.
- `awaitDispose` runs all disposals in parallel; `dispose` runs them sequentially.
- `DisposableMap` and `DisposableSet` automatically dispose values on `set`, `delete`, and `clear`, and dispose everything when the container itself is disposed.
- A polyfill for `Symbol.dispose` and `Symbol.asyncDispose` is applied at module load time for runtimes that don't yet support them natively.

## Usage

### Disposing single resources

```ts
import { dispose, awaitDispose } from "shelving/util";

// Synchronous — Disposable or callback
dispose(connection);
dispose(() => cleanup());

// Asynchronous — AsyncDisposable, Disposable, callback, or Promise
await awaitDispose(asyncConnection, syncResource, () => doCleanup(), pendingWork);
```

### Disposing multiple resources safely

```ts
import { dispose } from "shelving/util";

// All three run even if the first throws.
dispose(resourceA, resourceB, resourceC);
```

### Type guards

```ts
import { isDisposable, isAsyncDisposable } from "shelving/util";

isDisposable(obj);      // true if obj[Symbol.dispose] is a function
isAsyncDisposable(obj); // true if obj[Symbol.asyncDispose] is a function
```

### DisposableMap

```ts
import { DisposableMap } from "shelving/util";

const cache = new DisposableMap<string, Connection>();

cache.set("db", openConnection());     // stored
cache.set("db", reopenConnection());   // old connection disposed automatically
cache.delete("db");                    // connection disposed
cache[Symbol.dispose]();               // all remaining connections disposed
```

### DisposableSet

```ts
import { DisposableSet } from "shelving/util";

const listeners = new DisposableSet<EventListener>();
listeners.add(new EventListener());
listeners.delete(listener); // listener disposed
listeners[Symbol.dispose](); // all listeners disposed
```

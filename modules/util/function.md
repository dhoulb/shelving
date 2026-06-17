# Function types and helpers

Core type definitions and small utilities for working with functions. This file is the source of the [`AnyCaller`](/util/function/AnyCaller) type that threads through the whole library to produce accurate stack traces, and provides [`BLACKHOLE()`](/util/function/BLACKHOLE) and [`PASSTHROUGH()`](/util/function/PASSTHROUGH) — two no-op sentinels used throughout as safe default callbacks.

**Things to know:**

- `BLACKHOLE` is a stable function reference (not recreated on every call), so it is safe to compare with `===` and to use as a default prop value without triggering re-renders.
- `AnyCaller` is used as the last parameter of many util functions so errors show the correct call site in the stack trace — pass `myFunction` itself when wrapping another helper.

## Usage

### Checking and asserting functions

```ts
import { isFunction, assertFunction } from "shelving/util";

isFunction(() => {});   // true
isFunction("hello");    // false

assertFunction(callback); // throws RequiredError if not a function
```

### No-op sentinels

```ts
import { BLACKHOLE, PASSTHROUGH } from "shelving/util";

// Safe default for event handlers that do nothing.
<Button onClick={BLACKHOLE} />

// Identity transform — useful as a default mapping function.
const transform = options.map ?? PASSTHROUGH;
const result = transform(value); // returns value unchanged
```

### Callback types

```ts
import type { Callback, ValueCallback, ErrorCallback } from "shelving/util";

const onDone: Callback = () => console.log("done");
const onValue: ValueCallback<string> = (v) => console.log(v);
const onError: ErrorCallback = (err) => console.error(err);
```

## See also

- [util](/util) — full util module overview.

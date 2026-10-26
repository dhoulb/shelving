# shelving/util/function

- Kind: module
- Import: `import { … } from "shelving/util/function";`

Core type definitions and small utilities for working with functions. This file is the source of the `AnyCaller` type that threads through the whole library to produce accurate stack traces, and provides `BLACKHOLE()` and `PASSTHROUGH()` — two no-op sentinels used throughout as safe default callbacks.

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


## Functions

- [isFunction](function/isFunction.md): Is a value a function?
- [assertFunction](function/assertFunction.md): Assert that a value is a function.
- [PASSTHROUGH](function/PASSTHROUGH.md): Function that just passes through the first argument.
- [BLACKHOLE](function/BLACKHOLE.md): Function that does nothing with its arguments and always returns void.

## Types

- [Arguments](function/Arguments.md): Readonly unknown array that is being used as a set of arguments to a function.
- [UnknownFunction](function/UnknownFunction.md): Unknown function.
- [AnyFunction](function/AnyFunction.md): Any function (purposefully as wide as possible for use with extends X or is X statements).
- [AnyCaller](function/AnyCaller.md): Any calling function or constructor, usually referring to something that can call in the current scope that can appear in a stack trace.
- [Callback](function/Callback.md): A callback is a function that is called when something happens, optionally with multiple values.
- [ValueCallback](function/ValueCallback.md): A callback is a function that is called when something happens with a value.
- [ErrorCallback](function/ErrorCallback.md): Function that is called when something errors.

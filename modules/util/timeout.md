# Timeout helper

`Timeout` is a thin wrapper around `setTimeout` that tracks its own reference and cancels any in-flight timer before setting a new one. It removes the boilerplate of saving and clearing timeout handles manually.

**Things to know:**

- Calling `set()` always cancels the previous timeout before starting a new one — no need to call `clear()` first.
- Both `callback` and `ms` can be provided once at construction and then omitted from `set()` calls; they act as defaults.
- `exists` reflects whether a timeout is currently pending.

## Usage

```ts
import { Timeout } from "shelving/util";

// Create with a default callback and delay.
const t = new Timeout(() => console.log("done!"), 500);

t.set();           // starts a 500 ms timer
t.set();           // cancels the previous timer, starts a fresh 500 ms timer
t.exists;          // true
t.clear();         // cancels the timer
t.exists;          // false

// Override callback or delay per call.
t.set(() => save(), 1000);
```

### Debouncing

```ts
const debounced = new Timeout(doSearch, 300);

input.addEventListener("input", () => debounced.set()); // resets on every keystroke
```

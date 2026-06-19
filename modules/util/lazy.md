# Lazy value helpers

A tiny utility for values that may be supplied either as a plain value or as a factory function. Use `Lazy<T>` as a parameter type wherever you want callers to be able to defer construction, then call `getLazy()` to materialise the value.

## Usage

```ts
import { getLazy, type Lazy } from "shelving/util";

// Accept either a plain value or a factory function.
function createWidget(config: Lazy<WidgetConfig>): Widget {
  const resolved = getLazy(config);
  return new Widget(resolved);
}

createWidget({ color: "blue" });             // plain value
createWidget(() => ({ color: "blue" }));     // factory — called on demand

// Factory functions can receive arguments.
type LazyGreeting = Lazy<string, [name: string]>;
const greet: LazyGreeting = name => `Hello, ${name}!`;
getLazy(greet, "Alice"); // "Hello, Alice!"
```

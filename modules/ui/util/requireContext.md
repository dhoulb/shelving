# requireContext

Reads a React context and throws `RequiredError` if the value is `null` or `undefined`. Use it instead of `use(context)` when a context must be provided by an ancestor — every `require*()` hook in the library follows this pattern.

**Things to know:**

- Reads the context with React's `use()`, so it must be called inside a component or hook.
- Treats both `null` and `undefined` as "unset" and throws, naming the context's `displayName` in the message.
- Pass the calling function as `caller` so the thrown `RequiredError` is attributed to it (defaults to `requireContext` itself).

## Usage

```ts
import { requireContext } from "shelving/ui";

function requireNavigation(): NavigationStore {
  return requireContext(NavigationContext, requireNavigation);
}
```

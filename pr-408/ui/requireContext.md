# requireContext()

- Kind: function
- Import: `import { requireContext } from "shelving/ui";`

Use the value of a React `Context`, or throw `RequiredError` if the context was unset.

- Reads the context with React's `use()`, so it must be called inside a component or hook.
- Treats both `null` and `undefined` as "unset" and throws, naming the context's `displayName` in the message.

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


## Signatures

```ts
requireContext(context: Context<T | null>, caller?: AnyCaller): T
requireContext(context: Context<T | undefined>, caller?: AnyCaller): T
requireContext(context: Context<T>, caller?: AnyCaller): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `context` | `Context<T \| null>` | The React `Context` to read the current value of. |
| `caller` | `AnyCaller` | Function to attribute the thrown `RequiredError` to (defaults to `requireContext`). Optional. |
| `context` | `Context<T \| undefined>` |  |
| `caller` | `AnyCaller` | Optional. |
| `context` | `Context<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | The current context value, guaranteed non-nullish. |
| `T` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If the context value is `null` or `undefined` (i.e. used outside its provider). |

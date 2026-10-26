# useTransitionValue()

- Kind: function
- Import: `import { useTransitionValue } from "shelving/ui";`

Read a store's value, and re-render inside `startTransition()` when it changes, so `<ViewTransition>` boundaries animate.

- `useStore()` uses `useSyncExternalStore()`, and React always applies those updates synchronously. A synchronous update never starts a view transition.
- This hook copies the value into React state inside `startTransition()` instead.
- Internal for now: not exported from the `shelving/ui` barrel.

## Signatures

```ts
useTransitionValue(store: S): S["value"]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `store` | `S` | The store to read. Its value must not be loading or failed. |

## Returns

| Type | Description |
| --- | --- |
| `S["value"]` | The store's current value. |

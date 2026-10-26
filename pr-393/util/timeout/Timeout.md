# Timeout

- Kind: class
- Import: `import { Timeout } from "shelving/util/timeout";`

Stateful wrapper around `setTimeout()` that manages a single pending timeout at a time.
- Keeps track of the reference returned from `setTimeout()`.
- Clears any existing timeout when a new timeout is set.
- Allows a default callback and a default delay to be set that are applied to all new timeouts that don't specify their own.

## Signatures

```ts
new Timeout(callback: Callback | undefined = undefined, ms = 0)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `callback` | `Callback \| undefined` | Defaults to `undefined`. |
| `ms` | `unknown` | Defaults to `0`. |

## Returns

| Type | Description |
| --- | --- |
| `Timeout` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `exists` | `boolean` | Whether a timeout is currently pending. Read only. |

## Methods

- [Timeout.set()](Timeout/set.md): Cancel any existing timeout and set a new one.
- [Timeout.clear()](Timeout/clear.md): Cancel any existing timeout.

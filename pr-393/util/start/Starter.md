# Starter

- Kind: class
- Import: `import { Starter } from "shelving/util/start";`
- Implements: `Disposable`

Wrapper class to handle state on start/stop callback process.
- If process has already started, `starter.start()` won't be called twice (including if `start()` didn't return a `stop()` callback).
- Implements `Disposable` so it can be used with `using`, calling `stop()` on disposal.

## Signatures

```ts
new Starter<T>(start: StartCallback<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `start` | `StartCallback<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Starter<T>` |  |

## Methods

- [Starter.start()](Starter/start.md): Run the start callback (once).
- [Starter.stop()](Starter/stop.md): Run the stop callback (if one was returned by the start callback).

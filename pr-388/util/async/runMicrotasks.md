# runMicrotasks()

- Kind: function
- Import: `import { runMicrotasks } from "shelving/util/async";`

Run any queued microtasks now.

## Signatures

```ts
runMicrotasks(): Promise<void>
```

## Returns

| Type | Description |
| --- | --- |
| `Promise<void>` | A promise that resolves after all currently-queued microtasks have run. |

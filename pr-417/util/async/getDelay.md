# getDelay()

- Kind: function
- Import: `import { getDelay } from "shelving/util/async";`

Get a promise that automatically resolves after a delay.

## Signatures

```ts
getDelay(ms: number): Promise<void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `ms` | `number` | The delay in milliseconds before the promise resolves. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<void>` | A promise that resolves with `undefined` after `ms` milliseconds. |

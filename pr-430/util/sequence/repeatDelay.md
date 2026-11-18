# repeatDelay()

- Kind: function
- Import: `import { repeatDelay } from "shelving/util/sequence";`

Infinite sequence that yields every X milliseconds (yields a count of the number of iterations).

## Signatures

```ts
repeatDelay(ms: number): AsyncGenerator<number, void, void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `ms` | `number` | The number of milliseconds to wait between each yield. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncGenerator<number, void, void>` | An infinite async generator yielding `1`, `2`, `3`… one per interval. |

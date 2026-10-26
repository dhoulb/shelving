# awaitValues()

- Kind: function
- Import: `import { awaitValues } from "shelving/util/async";`

Get the result of multiple promises concurrently.

DH: An issue with `Promise.all()` is: if _one_ of its promises rejects, the parent promise rejects immediately.
- This leaves all of the other promises lost in unhandled purgatory.
- The program may then have dangling open threads that prevent the program from exiting, even after it has returned its main result.
- This function waits for the resolution of *all* promises before rejecting.

## Signatures

```ts
awaitValues(...promises: T): Promise<{ readonly [P in keyof T]: Awaited<T[P]> }>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `promises` | `T` | Values (usually async, but not necessarily) that we need to wait for. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<{ readonly [P in keyof T]: Awaited<T[P]> }>` | Array of values of all promises (in the same order/positions as input). |

## Throws

| Type | Description |
| --- | --- |
| `Errors` | If one or more promises throws all rejection reasons after resolving all of the promises. |

# awaitErrors()

- Kind: function
- Import: `import { awaitErrors } from "shelving/util/async";`

Get the rejection reasons of multiple promises (concurrently).

## Signatures

```ts
awaitErrors(...promises: PromiseLike<unknown>[]): Promise<ImmutableArray<unknown>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `promises` | `PromiseLike<unknown>[]` | Values (usually async, but not necessarily) that we need to wait for. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<ImmutableArray<unknown>>` | Array of rejection reasons of all promises (or empty array if no promises threw). |

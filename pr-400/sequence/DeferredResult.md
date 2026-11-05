# DeferredResult

- Kind: type
- Import: `import { DeferredResult } from "shelving/sequence";`

Pending result of a `DeferredSequence` — either a standard `IteratorResult` or a `DeferredErrorResult` rejection.

## Signatures

```ts
IteratorResult<T, R | undefined> | DeferredErrorResult
```

## Types

- `IteratorResult`
- [DeferredErrorResult](DeferredErrorResult.md): Result representing a rejection in a DeferredSequence, carrying the thrown reason.

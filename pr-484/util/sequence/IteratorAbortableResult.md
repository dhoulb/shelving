# IteratorAbortableResult

- Kind: type
- Import: `import { IteratorAbortableResult } from "shelving/util/sequence";`

Result of stepping an iterator that may either yield, finish itself, or be aborted externally.
- Union of a normal `IteratorResult<T, R>` and an `IteratorAbortResult<R>`.

## Signatures

```ts
IteratorResult<T, R> | IteratorAbortResult<R>
```

## Types

- `IteratorResult`
- [IteratorAbortResult](IteratorAbortResult.md): Result of an iterator that was aborted via an external signal rather than concluding itself.

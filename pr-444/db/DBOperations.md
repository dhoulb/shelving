# DBOperations

- Kind: type
- Import: `import { DBOperations } from "shelving/db";`

Readonly array of `DBOperation` entries, e.g. the log recorded by a `RecordingDBProvider`.

## Signatures

```ts
ImmutableArray<DBOperation<I, T>>
```

## Types

- [ImmutableArray](../util/array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- [DBOperation](DBOperation.md): Structured log entry recording a single database operation performed through a RecordingDBProvider.

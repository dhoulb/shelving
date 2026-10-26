# shelving/util/dispose

- Kind: module
- Import: `import { … } from "shelving/util/dispose";`

## Functions

- [dispose()](dispose/dispose.md): Safely dispose one or more synchronous Disposable values.
- [awaitDispose()](dispose/awaitDispose.md): Safely dispose one or more AsyncDisposable or Disposable values in parallel — all are disposed even if some throw, errors are rethrown at the end.
- [isDisposable()](dispose/isDisposable.md): Is an unknown value a disposable object?
- [isAsyncDisposable()](dispose/isAsyncDisposable.md): Is an unknown value an async disposable object?

## Classes

- [DisposableMap](dispose/DisposableMap.md): Version of Map that has disposable values.
- [DisposableSet](dispose/DisposableSet.md): Version of Set that has disposable items.

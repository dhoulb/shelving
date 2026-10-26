# DisposableSet

- Kind: class
- Import: `import { DisposableSet } from "shelving/util/dispose";`
- Extends: `Set<T>`
- Implements: `Disposable`

Version of `Set` that has disposable items.
- Values are disposed when they're deleted from the map.
- Values are disposed when all items are cleared.
- All items are cleared (and disposed) when this map itself is disposed.

## Signatures

```ts
new DisposableSet<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `DisposableSet<T>` |  |

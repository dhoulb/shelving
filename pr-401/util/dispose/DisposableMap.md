# DisposableMap

- Kind: class
- Import: `import { DisposableMap } from "shelving/util/dispose";`
- Extends: `Map<K, T>`
- Implements: `Disposable`

Version of `Map` that has disposable values.
- Old values are disposed when they're set to a new value.
- Values are disposed when they're deleted from the map.
- Values are disposed when all items are cleared.
- All items are cleared and their values are disposed when this map itself is disposed.

## Signatures

```ts
new DisposableMap<K, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `DisposableMap<K, T>` |  |

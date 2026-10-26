# pickArrayItem

- Kind: constant
- Import: `import { pickArrayItem } from "shelving/util/array";`

Pick an item from an array (immutably) and return a new array with that item (or the same array if no changes were made).

## Signatures

```ts
pickArrayItem: <T>(items: PossibleArray<T>, pick: T) => ImmutableArray<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new array containing only the picked item, or the same array if nothing changed. |

# toggleArrayItem

- Kind: constant
- Import: `import { toggleArrayItem } from "shelving/util/array";`

Toggle an item in and out of an array (immutably) and return a new array with or without the specified item (or the same array if no changes were made).

## Signatures

```ts
toggleArrayItem: <T>(items: PossibleArray<T>, toggle: T) => ImmutableArray<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new array with the item toggled, or the same array if nothing changed. |

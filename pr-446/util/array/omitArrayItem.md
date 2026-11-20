# omitArrayItem

- Kind: constant
- Import: `import { omitArrayItem } from "shelving/util/array";`

Remove an item from an array (immutably) and return a new array without that item (or the same array if no changes were made).

## Signatures

```ts
omitArrayItem: <T>(items: PossibleArray<T>, omit: T) => ImmutableArray<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new array without the omitted item, or the same array if nothing changed. |

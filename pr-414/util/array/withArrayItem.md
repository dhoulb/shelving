# withArrayItem

- Kind: constant
- Import: `import { withArrayItem } from "shelving/util/array";`

Add an item to an array (immutably) and return a new array with that item (or the same array if no changes were made).

## Signatures

```ts
withArrayItem: <T>(items: PossibleArray<T>, add: T) => ImmutableArray<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new array including the added item, or the same array if nothing changed. |

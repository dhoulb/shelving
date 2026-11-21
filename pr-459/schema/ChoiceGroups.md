# ChoiceGroups

- Kind: type
- Import: `import { ChoiceGroups } from "shelving/schema";`

Named groups of option keys for a `ChoiceSchema` in `{ group: [key] }` format, e.g. `{ Fruit: ["apple", "pear"] }`.

- Groups are a display hint only: validation and `format()` use `options`, and do not change.
- The group order and the key order in each group set the display order.

## Signatures

```ts
{
	readonly [group: string]: ImmutableArray<K>;
}
```

## Types

- [ImmutableArray](../util/array/ImmutableArray.md): Immutable array: an array that cannot be changed.

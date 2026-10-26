# OptionalItemSequence

- Kind: type
- Import: `import { OptionalItemSequence } from "shelving/util/item";`

An async sequence of optional item objects.

## Signatures

```ts
AsyncIterable<OptionalItem<I, T>, void, void>
```

## Types

- `AsyncIterable`
- [OptionalItem](OptionalItem.md): Item object, or undefined to indicate the item doesn't exist.

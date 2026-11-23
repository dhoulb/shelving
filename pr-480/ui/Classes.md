# Classes

- Kind: type
- Import: `import { Classes } from "shelving/ui";`

Set of classnames that can be joined into a single `className` string.

- `string` — used directly as a classname.
- `null` or `undefined` — ignored.
- Array of classnames — recursively parsed.

## Signatures

```ts
string | null | undefined | readonly Classes[] | Variants
```

## Types

- [Classes](Classes.md): Set of classnames that can be joined into a single className string.
- [Variants](Variants.md): Dictionary of boolean variant flags whose true-valued keys become class names.

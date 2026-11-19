# Element

- Kind: type
- Import: `import { Element } from "shelving/util/element";`

Element with a type, props, and optional key (compatible with `React.ReactElement`).
- Declared as a `type`, not an `interface`, so its implicit index signature lets it satisfy `Data` — `queryElements()` runs elements through `queryItems()`.

## Signatures

```ts
{
	readonly type: string | ((props: P) => Elements | null);
	readonly props: P;
	readonly key: string | null;
	readonly $$typeof?: symbol;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string \| ((props: P) => Elements \| null)` | Read only. |
| `props` | `P` | Read only. |
| `key` | `string \| null` | Read only. |
| `$$typeof` | `symbol` | Read only. Optional. |

## Types

- [Elements](Elements.md): Collection of elements (compatible with React.ReactNode).

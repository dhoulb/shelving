# Mapping

- Kind: type
- Import: `import { Mapping } from "shelving/ui";`

Dispatch table from a `JSX.IntrinsicElements` key to a renderer component.
- Each entry is optional — unmapped elements fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` HTML element).
- Per-entry component receives `JSX.IntrinsicElements[K]` — the declared props for that element type.

## Signatures

```ts
{
	[K in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[K]>;
}
```

## Types

- `JSX.IntrinsicElements`
- `ComponentType`
- `K`

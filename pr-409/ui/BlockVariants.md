# BlockVariants

- Kind: interface
- Import: `import { BlockVariants } from "shelving/ui";`
- Extends: `IndentVariants`

Variants for block level elements.

## Signatures

```ts
{
	middle?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `middle` | `boolean \| undefined` | Make the block at least as tall as its container, and centre its content vertically (defaults to `false`). - Content taller than the container makes the block grow, so a scroll box scrolls it from the top and nothing is cut off. - Has no effect on flex components such as `<Row>` and `<Column>`: wrap them in a `<Block middle>`. Optional. |

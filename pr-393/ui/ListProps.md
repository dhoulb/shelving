# ListProps

- Kind: interface
- Import: `import { ListProps } from "shelving/ui";`
- Extends: `GapVariants`

Props for `List` — colour, gap, space, and typography variants plus its list items and an `ordered` toggle.

## Signatures

```ts
{
	readonly children: ImmutableArray<ReactNode>;
	readonly ordered?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `ImmutableArray<ReactNode>` | Read only. |
| `ordered` | `boolean \| undefined` | Read only. Optional. |

# TreeButtonProps

- Kind: interface
- Import: `import { TreeButtonProps } from "shelving/ui";`
- Extends: `ButtonVariants`

Props for the `TreeButton` component — the element reference plus button variants.

## Signatures

```ts
{
	readonly name: string;
	readonly children?: ReactNode | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Reference to an element in the tree — a flat key (`"Store"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). Read only. |
| `children` | `ReactNode \| undefined` | Visible label — defaults to the resolved element's `title`, falling back to `name`. Read only. Optional. |

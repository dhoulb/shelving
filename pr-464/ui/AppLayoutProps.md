# AppLayoutProps

- Kind: interface
- Import: `import { AppLayoutProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for `<AppLayout>`: the `nav` bar content and the content slot `children`.

## Signatures

```ts
{
	nav?: ReactNode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `nav` | `ReactNode` | Items for the bar below the content, for example a `<StackButton>` for each tab. Set `false` (or leave it out) to show no bar. Optional. |

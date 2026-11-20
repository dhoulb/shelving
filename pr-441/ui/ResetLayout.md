# ResetLayout

- Kind: component
- Import: `import { ResetLayout } from "shelving/ui";`

Layout that only removes the margin and padding around the page, so content can go edge to edge.
- It sets margin and padding to zero on `<html>`, `<body>`, and each element between `<body>` and the layout (for example `<div id="root">`).
- It does not lock, scroll, or centre. The page scrolls as normal.

A layout that removes the margin and padding around the page, so content such as `<Panel>` goes edge to edge. It does nothing else.

**Things to know:**

- It sets margin and padding to zero on `<html>`, `<body>`, and each element between `<body>` and the layout, for example a mount element such as `<div id="root">`.
- It does not lock the document, scroll, or centre. The page scrolls as normal.
- Use it for a simple page made of full-width bands. For an app with chrome, use `<AppLayout>`, `<SidebarLayout>` or `<FixedLayout>`. They reset the margins too.

## Usage

```tsx live
import { Block, Panel, Paragraph, ResetLayout, Title } from "shelving/ui";

<ResetLayout>
	<Panel color="primary">
		<Block width="narrow">
			<Title>Edge to edge</Title>
		</Block>
	</Panel>
	<Panel>
		<Block width="narrow">
			<Paragraph>The panels touch the sides of the page.</Paragraph>
		</Block>
	</Panel>
</ResetLayout>;
```

## Styling

`ResetLayout` has no hooks of its own and reads no global tokens.


## Signatures

```ts
ResetLayout({ children }: ResetLayoutProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ResetLayoutProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

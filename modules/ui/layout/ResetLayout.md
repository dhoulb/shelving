# ResetLayout

A layout that removes the margin and padding around the page, so content such as `<Panel>` goes edge to edge. It does nothing else.

**Things to know:**

- It sets margin and padding to zero on `<html>` and `<body>`, like the other layouts. It does not change a mount element such as `<div id="root">`.
- It does not lock the document, scroll, or centre. The page scrolls as normal.
- Use it for a simple page made of full-width bands. For an app with chrome, use `<AppLayout>`, `<SidebarLayout>` or `<FixedLayout>`. They reset the margins too.

## Usage

```tsx live
import { Block, Panel, Paragraph, ResetLayout, Title } from "shelving/ui";

<ResetLayout>
	<Panel as="header" color="primary">
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

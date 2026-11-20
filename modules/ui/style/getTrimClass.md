# getTrimClass

The `trim` variant prop trims the start margin of a block's first child and the end margin of its last child — `<Block padding="large" trim>`. Use it on a box with padding, so the padding is not doubled by the margins of its content.

**Things to know:**

- Blocks keep their outer margins as the first or last child. In normal flow a child's margin merges with its parent's margin, so most containers need no trim. `<Row>`, `<Column>` and `<Grid>` set every child's margin to 0 and trim each child's content, so the gap is the only space between children. They need no trim either.
- `<Card>`, `<Panel>`, `<Details>` and `<Blockquote>` trim by default. Set `trim={false}` to keep the margins. `<Modal>`, the `<Popover>` panel and table cells always trim.
- Where the browser has `margin-trim`, it trims the margins itself, also margins that pass through a child from deeper down. Other browsers use a fallback that trims the first and last children three levels deep.
- The fallback skips a child hidden with `display: none`. React hides old content that way while a `<Suspense>` fallback shows after it, so a loading spinner gets the same margin as the content it replaces.

```tsx
<Block padding="large" trim>
	<Paragraph>No space above this paragraph.</Paragraph>
	<Paragraph>No space below this paragraph.</Paragraph>
</Block>;
```

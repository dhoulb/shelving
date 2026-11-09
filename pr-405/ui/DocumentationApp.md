# DocumentationApp()

- Kind: function
- Import: `import { DocumentationApp } from "shelving/ui";`

Documentation app.
- Build upon `<TreeApp>` to include a `<DocumentationSearchPage>` at its `/search` URL, and a `<DocumentationPlaygroundPage>` at its `/playground` URL.

## Signatures

```ts
DocumentationApp({
	tree,
	routes = {
		"/search": DocumentationSearchPage,
		[`/${PLAYGROUND_PAGE_PATH}`]: DocumentationPlaygroundPage,
	},
	sidebar = (
		<TreeSidebar>
			<Menu small>
				<MenuItem href="/search">Search</MenuItem>
				<MenuItem href={`/${PLAYGROUND_PAGE_PATH}`}): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `unknown` |  |

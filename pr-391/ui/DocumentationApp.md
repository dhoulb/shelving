# DocumentationApp()

- Kind: function
- Import: `import { DocumentationApp } from "shelving/ui";`

Documentation app.
- Build upon `<TreeApp>` to include a `<DocumentationSearchPage>` at its `/search` URL.

## Signatures

```ts
DocumentationApp({
	tree,
	routes = {
		"/search": DocumentationSearchPage,
	},
	sidebar = (
		<TreeSidebar>
			<Menu small>
				<MenuItem href="/search">Search</MenuItem>
			</Menu>
		</TreeSidebar>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `unknown` |  |

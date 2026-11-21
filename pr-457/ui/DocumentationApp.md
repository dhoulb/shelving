# DocumentationApp

- Kind: component
- Import: `import { DocumentationApp } from "shelving/ui";`

Documentation app.
- Works like `<TreeApp>`, and adds a `<DocumentationSearchPage>` at its `/search` URL.
- Adds a `<DocumentationPlaygroundPage>` at its `/playground` URL. The playground fills the whole window, so it renders outside the `<SidebarLayout>`.

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
				<MenuItem href={`/${PLAYGROUND_PAGE_PATH}`}): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `unknown` |  |

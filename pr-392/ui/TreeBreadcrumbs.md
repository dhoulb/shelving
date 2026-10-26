# TreeBreadcrumbs

- Kind: component
- Import: `import { TreeBreadcrumbs } from "shelving/ui";`

Breadcrumb trail of links to a tree page's ancestors, separated by `›` arrow icons.

- Built from the page's own `path`: each ancestor prefix is looked up in the tree map for its title, and links to its cumulative path.
- Prefixes with no entry (e.g. the partial half of a `"util/string"` module name) are skipped, so composite names collapse to a single crumb.
- The current item is deliberately omitted — the page `<Title>` already names it.
- Block spacing defaults to section spacing (via `getBlockClass()`); pass `space` to override.
- Renders nothing at the tree root (no ancestors) or when there's no `<TreeProvider>` to resolve labels from.

## Signatures

```ts
TreeBreadcrumbs({ tint = "70", left = true, wrap = true, className, ...props }: TreeBreadcrumbsProps): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeBreadcrumbsProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` |  |

## Examples

```ts
<TreeBreadcrumbs />
```

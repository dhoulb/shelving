# LinkClickable()

- Kind: function
- Import: `import { LinkClickable } from "shelving/ui";`

Render an `<a href="">` element, resolving its `href` against the current page URL and marking it active when it matches.
- The `href` is resolved against the current page URL and site root so site-absolute paths (`/foo`) honour the base subfolder.
- Sets `aria-current="page"` when the link points at the current URL.

## Signatures

```ts
LinkClickable({
	href,
	disabled = !href,
	target,
	download,
	title,
	selected,
	back,
	children = "Go",
	className,
}: StylableClickableProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `StylableClickableProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<LinkClickable href="/about" className="link">About</LinkClickable>
```

# SpanClickable()

- Kind: function
- Import: `import { SpanClickable } from "shelving/ui";`

Render a non-interactive `<span>` element, used as the fallback when neither `href` nor `onClick` is provided.

## Signatures

```ts
SpanClickable({
	title,
	children = "Click", //
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
<SpanClickable className="label">Static</SpanClickable>
```

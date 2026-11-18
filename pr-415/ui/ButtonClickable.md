# ButtonClickable()

- Kind: function
- Import: `import { ButtonClickable } from "shelving/ui";`

Render a `<button>` element that runs its `onClick` handler through a `BusyStore` and shows a loading spinner while busy.
- Notifies the user of the handler's returned value (success) or thrown value (error).
- Disabled and ignores clicks while a previous click is still pending.

## Signatures

```ts
ButtonClickable({
	onClick,
	disabled = !onClick,
	title,
	selected,
	children = "Click",
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
<ButtonClickable onClick={save} className="btn">Save</ButtonClickable>
```

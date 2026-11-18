# QueryInputBase()

- Kind: function
- Import: `import { QueryInputBase } from "shelving/ui";`

Text input that queries a list of items, then shows the list in a popover or inline.
- Shared by `QueryRadiosInput` and `QueryCheckboxesInput`, which each render their own list.
- The text input is never required: the picked items are the value, not the text.
- The store is kept when the parent renders again with a new `onQuery()`, so the list does not load again.
- Errors show in an `<ErrorNotice>`. Loading and empty states show in an `<Empty>`.

## Signatures

```ts
QueryInputBase({
	schema,
	onQuery,
	popover = true,
	empty = `No ${schema.many}`,
	list,
	className,
	...props
}: QueryInputBaseFrameProps<I, O>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `QueryInputBaseFrameProps<I, O>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

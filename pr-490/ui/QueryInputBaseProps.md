# QueryInputBaseProps

- Kind: interface
- Import: `import { QueryInputBaseProps } from "shelving/ui";`
- Extends: `InputProps`

Props shared by `QueryRadiosInput` and `QueryCheckboxesInput`.

## Signatures

```ts
{
	schema: Schema<I>;
	onQuery: PayloadFetchCallback<I, ImmutableArray<O> | undefined>;
	delay?: number | undefined;
	formatter?: ((value: O) => ReactNode) | undefined;
	popover?: boolean | undefined;
	empty?: ReactNode | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `schema` | `Schema<I>` | Schema for the text input. Its `one` and `many` name the items, e.g. `one: "user"` shows "No users". |
| `onQuery` | `PayloadFetchCallback<I, ImmutableArray<O> \| undefined>` | Called with the current text value to return matching items whenever the text input changes. - Debounced: only called once the text has not changed for `delay`. - Automatically shows a loading state while loading. - Returning `undefined` signals to close the popover (or, with `popover={false}`, to show no list). |
| `delay` | `number \| undefined` | How long the text must stay the same before `onQuery()` is called, in milliseconds. Defaults to `1000`. |
| `formatter` | `((value: O) => ReactNode) \| undefined` | Format an item of type `O` for display in the list, for example as text or as an avatar. Optional. |
| `popover` | `boolean \| undefined` | Show the results in a popover (the default), or set `false` to show them inline, as a list below the input. - Inline, the list shows at once: `onQuery()` is called with the schema's default value (e.g. `""`) on mount. - Inline, an empty input still queries. Optional. |
| `empty` | `ReactNode \| undefined` | Message that shows in an `<Empty>` when the query returns `[]` (set to `""` to show no message). - Inline, it shows only once something is typed: an empty input that finds nothing shows nothing. Defaults to `` `No ${schema.many}`, e.g. "No users" ``. |

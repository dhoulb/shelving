# QueryRadiosInput

- Kind: component
- Import: `import { QueryRadiosInput } from "shelving/ui";`

Combo box that queries a list of items and lets the user pick one, with radios.
- Shows an input based on a `schema` of type `I`; its values are piped to the `onQuery()` callback.
- Shows a `<Popover>` with a radio list of returned items to pick a final value of type `O`. Picking an item closes the popover.
- With `popover={false}`, shows the radio list inline below the input instead, like a `<select>` list box.
- Errors, loading, and empty states are handled automatically.

Combo box that queries a list of items and lets the user pick one. The text in the input goes to `onQuery()`, and the items it returns show as a radio list.

**Things to know:**

- `onQuery()` is debounced (one second). Loading and empty states show in an `<Empty>`, and errors in an `<ErrorNotice>`.
- By default the list shows in a `<Popover>`, which closes when the user picks an item.
- With `popover={false}` the list shows inline, below the input, like a `<select>` list box. It queries the schema's default value on mount, so the list shows before the user types. Picking an item keeps the list.
- `formatter` can return any `ReactNode`, for example an avatar, not only a string.
- The empty message is "No" plus the schema's `many`. Set `one: "user"` on the schema to show "No users", or set `empty` (`""` shows no message).
- To pick more than one item, use `<QueryCheckboxesInput>`.

## Usage

### Popover

```tsx
import { QueryRadiosInput } from "shelving/ui";
import { StringSchema } from "shelving/schema";

const SEARCH = new StringSchema({ title: "Search", one: "user" });

<QueryRadiosInput name="user" schema={SEARCH} onQuery={search} value={user} onValue={setUser} />
```

### Inline list with avatars

```tsx
<QueryRadiosInput
	popover={false}
	name="user"
	schema={SEARCH}
	onQuery={search}
	formatter={user => <Avatar user={user} />}
	onValue={setUser}
/>
```

## Styling

`<QueryRadiosInput>` has no own hooks. The popover version uses the `<Popover>` styles. The inline version is a `<Column>` with the input and the `<ArrayRadioInputs>` list, so it uses their styles.


## Signatures

```ts
QueryRadiosInput({
	value,
	onValue,
	formatter = formatValue,
	popover = true,
	...props
}: QueryRadiosInputProps<I, O>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `QueryRadiosInputProps<I, O>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A combo box element wrapping the input and results popover (or the inline list). |

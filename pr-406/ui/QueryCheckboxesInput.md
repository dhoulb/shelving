# QueryCheckboxesInput

- Kind: component
- Import: `import { QueryCheckboxesInput } from "shelving/ui";`

Combo box that queries a list of items and lets the user pick any number of them, with checkboxes.
- Shows an input based on a `schema` of type `I`; its values are piped to the `onQuery()` callback.
- Shows a `<Popover>` with a checkbox list of returned items. The value is the array of checked items. The popover stays open while the user checks items.
- With `popover={false}`, shows the checkbox list inline below the input instead.
- Checked items stay checked when a new query does not return them. Items are compared with `===`, so `onQuery()` must return the same objects each time (or primitives).
- Errors, loading, and empty states are handled automatically.

Combo box that queries a list of items and lets the user pick any number of them. The text in the input goes to `onQuery()`, and the items it returns show as a checkbox list. The value is the array of checked items.

**Things to know:**

- It works like `<QueryRadiosInput>`: the same `schema`, `onQuery()`, `formatter`, `popover` and `empty` props, and the same loading, empty and error states.
- The popover stays open while the user checks items.
- Checked items stay in the value when a new search does not return them. Items are compared with `===`, so `onQuery()` must return the same objects each time (or primitives).
- Show your own button to act on the checked items, for example "Invite".

## Usage

### Inline list with a button

```tsx
import { Button, QueryCheckboxesInput } from "shelving/ui";
import { StringSchema } from "shelving/schema";

const SEARCH = new StringSchema({ title: "Search", one: "user" });

const [users, setUsers] = useState<readonly User[]>([]);

<QueryCheckboxesInput
	popover={false}
	name="users"
	schema={SEARCH}
	onQuery={search}
	formatter={user => <Avatar user={user} />}
	value={users}
	onValue={v => setUsers(v ?? [])}
/>
<Button onClick={() => invite(users)}>Invite</Button>
```

## Styling

`<QueryCheckboxesInput>` has no own hooks. The popover version uses the `<Popover>` styles. The inline version is a `<Column>` with the input and the `<ArrayCheckboxInputs>` list, so it uses their styles.


## Signatures

```ts
QueryCheckboxesInput({
	value,
	onValue,
	formatter = formatValue,
	...props
}: QueryCheckboxesInputProps<I, O>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `QueryCheckboxesInputProps<I, O>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A combo box element wrapping the input and results popover (or the inline list). |

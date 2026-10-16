# QueryInput

Combo box that queries a list of items and lets the user pick one. The text in the input goes to `onQuery()`, and the items it returns show as a radio list.

**Things to know:**

- `onQuery()` is debounced (one second), and loading, error and empty states show automatically.
- By default the list shows in a `<Popover>`, which closes when the user picks an item.
- With `popover={false}` the list shows inline, below the input, like a `<select>` list box. It queries the schema's default value on mount, so the list shows before the user types. Picking an item keeps the list.
- `formatter` can return any `ReactNode`, for example an avatar, not only a string.
- `empty` sets the message for no results (`""` shows no message).

## Usage

### Popover

```tsx
import { QueryInput } from "shelving/ui";

<QueryInput name="user" schema={SEARCH} onQuery={search} value={user} onValue={setUser} />
```

### Inline list with avatars

```tsx
<QueryInput
	popover={false}
	name="user"
	schema={SEARCH}
	onQuery={search}
	formatter={user => <Avatar user={user} />}
	onValue={setUser}
/>
```

## Styling

The popover version uses the `<Popover>` styles. The inline version is a `<Column>` with the input and the `<ArrayRadioInputs>` list, so it uses their styles.

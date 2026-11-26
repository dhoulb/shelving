# DictionaryInput

- Kind: component
- Import: `import { DictionaryInput } from "shelving/ui";`

Repeating input that edits a dictionary, with an editable key and schema-validated value per entry.
- Each value is validated and rendered using the supplied `items` schema.
- Enforces `min`/`max` entry count and offers add, remove, and clear controls.

A list of key and value inputs that edits a dictionary (an object with any keys). The user can add, rename and remove entries.

**Things to know:**

- Each row has a `<TextInput>` for the key, the `<SchemaInput>` for the value, and a remove button.
- `items` is the `Schema` for each value. "Add" adds an entry with the schema's default value, keyed by `one`. Rename it to add another.
- `min` and `max` set the minimum and maximum number of entries. "Clear" removes all entries.
- `one` and `many` name the entries in the button labels (default "item" and "items").
- With no entries, it shows a `<ButtonInput>` with the `placeholder`.
- In a `<Form>`, a `DictionarySchema` makes this input for you.

## Usage

```tsx live
import { useState } from "react";
import { DictionaryInput, Paragraph } from "shelving/ui";
import { STRING } from "shelving/schema";

function Meta() {
	const [meta, setMeta] = useState<{ readonly [key: string]: string }>({ author: "Alice" });
	return (
		<>
			<DictionaryInput name="meta" items={STRING} one="field" placeholder="Add a field" value={meta} onValue={v => setMeta(v ?? {})} />
			<Paragraph>{JSON.stringify(meta)}</Paragraph>
		</>
	);
}

<Meta />;
```

## Styling

`DictionaryInput` has no own hooks. It is a `<Row>` of inputs and `<Button>` elements, so it uses their styles.


## Signatures

```ts
DictionaryInput(props: DictionaryInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DictionaryInputProps<T>` |  |
| `.one` | `string` | Optional. |
| `.many` | `string` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.items` | `Schema<T>` | Schema for the items in the repeater. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one key/value row per entry plus add/clear controls. |

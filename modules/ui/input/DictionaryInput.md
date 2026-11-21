# DictionaryInput

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

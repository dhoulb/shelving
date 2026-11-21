# DataInput

A group of inputs that edits an object, one input for each property. Use it for a nested object inside a form, such as an address.

**Things to know:**

- `props` holds a `Schema` for each property. Each property shows the `<SchemaInput>` for its schema.
- `onValue()` gets the whole object, with the changed property set.
- Two properties or fewer show side by side in a row. More show in a column.
- `message` can hold a message for each property, keyed by its name (see `splitMessage()`).
- In a `<Form>`, a nested `DataSchema` makes this input for you.

## Usage

```tsx live
import { useState } from "react";
import { DataInput, Paragraph } from "shelving/ui";
import { STRING } from "shelving/schema";

const NAME = { first: STRING, last: STRING };

function FullName() {
	const [name, setName] = useState({ first: "Ada", last: "Lovelace" });
	return (
		<>
			<DataInput name="name" props={NAME} value={name} onValue={v => v && setName(v)} />
			<Paragraph>
				Hello, {name.first} {name.last}.
			</Paragraph>
		</>
	);
}

<FullName />;
```

## Styling

`DataInput` has no own hooks. It is a `<Row>` of inputs, so it uses their styles.

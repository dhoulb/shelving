# ArrayInput

- Kind: component
- Import: `import { ArrayInput } from "shelving/ui";`

Repeating input that edits an array of items, adding a `SchemaInput` row per item.
- Each item is validated and rendered using the supplied `items` schema.
- Enforces `min`/`max` length and offers add, remove, and clear controls.

A list of inputs that edits an array. The user can add and remove items.

**Things to know:**

- `items` is the `Schema` for each item. Each row shows the `<SchemaInput>` for that schema, with a remove button.
- "Add" adds a new item with the schema's default value. "Clear" removes all items.
- `min` and `max` set the minimum and maximum number of items. The remove button is disabled at `min`, and "Add" is disabled at `max`.
- `one` and `many` name the items in the button labels (default "item" and "items").
- With no items, it shows a `<ButtonInput>` with the `placeholder`. A tap adds the first item.
- `message` can hold a message for each item, keyed by its index (see `splitMessage()`).
- In a `<Form>`, an `ArraySchema` makes this input for you.

## Usage

```tsx live
import { useState } from "react";
import { ArrayInput, Paragraph } from "shelving/ui";
import { STRING } from "shelving/schema";

function Tags() {
	const [tags, setTags] = useState<readonly string[]>(["red", "green"]);
	return (
		<>
			<ArrayInput name="tags" items={STRING} one="tag" placeholder="Add a tag" max={4} value={tags} onValue={v => setTags(v ?? [])} />
			<Paragraph>Tags: {tags.join(", ") || "none"}</Paragraph>
		</>
	);
}

<Tags />;
```

## Styling

`ArrayInput` has no own hooks. It is a `<Column>` of `<Row>` elements with inputs and `<Button>` elements, so it uses their styles.


## Signatures

```ts
ArrayInput(props: ArrayInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayInputProps<T>` |  |
| `.one` | `string` | Optional. |
| `.many` | `string` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.items` | `Schema<T>` | Schema for the items in the repeater. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one input row per array item plus add/clear controls. |

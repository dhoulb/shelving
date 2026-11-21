# OutputInput

- Kind: component
- Import: `import { OutputInput } from "shelving/ui";`

Show static read-only content styled as an input, falling back to `placeholder` when empty.

Read-only content that looks like an input. Renders an `<output>`.

**Things to know:**

- Use it to show a value in a form that the user cannot change, such as a total or an account ID.
- The children are the content. With no children it shows `title`, then `placeholder` in grey.
- The content can be any `ReactNode`, not only text.

## Usage

```tsx live
import { Field, OutputInput } from "shelving/ui";

<Field title="Account ID">
	<OutputInput name="id">ac_1042</OutputInput>
</Field>
<Field title="Discount">
	<OutputInput name="discount" placeholder="None" />
</Field>
```

## Styling

`OutputInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


## Signatures

```ts
OutputInput({ title, placeholder, children = title, className, ...props }: OutputInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `OutputInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | An `<output>` element styled like an input. |

# ButtonInput

- Kind: component
- Import: `import { ButtonInput } from "shelving/ui";`

Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided.
- Falls back to rendering the `placeholder` when no `children`/`title` content is supplied.

## Signatures

```ts
ButtonInput({ title, placeholder, children = title, className, ...props }: ButtonInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ButtonInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `Clickable` element styled with the button-input class. |

## Examples

```ts
<ButtonInput name="choose" onClick={open}>Choose…</ButtonInput>
```

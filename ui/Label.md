# Label

- Kind: component
- Import: `import { Label } from "shelving/ui";`

Label heading, a `<h3>` with a labelly appearance (UPPERCASE but with a smaller text size).
- This is the default style used by things like a `<th>` from a `<table>`.
- Default text properties for all of these can be controlled with global variables: `--size-label`, `--font-label`, `--case-label`.

A small heading with the label style: small, bold and uppercase. Renders an `<h3>` by default.

**Things to know:**

- Use it to name a group of content, such as a group of links in a sidebar.
- Set `level` to render a different heading element (`"1"` to `"6"`). The style stays the same.
- The label style is shared. A table header `<th>` and the terms in `<Definitions>` use the same global tokens: `--font-label`, `--weight-label`, `--size-label` and `--case-label`. Change those to restyle all labels at once.
- To label a form input, use `<Field>`. It renders a real `<label>`.
- Takes the same props as `<Heading>`.

## Usage

### Label

```tsx live
import { Label, Paragraph } from "shelving/ui";

<Label>Billing</Label>
<Paragraph>Your next invoice is on 1 December.</Paragraph>
```

### Other heading level

```tsx live
import { Label } from "shelving/ui";

<Label level="2">Account</Label>;
```

## Styling

Override these hooks at `:root`. The tint hook (`--label-color`) is declared again in every tint scope, so override it at `:root, .tint`.

| Variable          | Styles                              | Default                         |
| ----------------- | ----------------------------------- | ------------------------------- |
| `--label-color`   | Text colour                         | `var(--tint-70)`                |
| `--label-space`   | Outer block margin (top and bottom) | `var(--space-paragraph)` (16px) |
| `--label-font`    | Font family                         | `var(--font-label)`             |
| `--label-weight`  | Font weight                         | `var(--weight-label)` (700)     |
| `--label-size`    | Font size                           | `var(--size-label)` (12.8px)    |
| `--label-leading` | Line height                         | `var(--leading-auto)`           |
| `--label-case`    | Text case                           | `var(--case-label)` (uppercase) |

**Global tokens it reads:** `--tint-70`, `--space-paragraph`, `--font-label`, `--weight-label`, `--size-label`, `--leading-auto`, `--case-label`.


## Signatures

```ts
Label({ level = "3", children, className, ...props }: LabelProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `LabelProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

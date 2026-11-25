# Definitions

- Kind: component
- Import: `import { Definitions } from "shelving/ui";`

Description list — a sequence of term/value pairs rendered as a `<dl>`.
- Children are raw `<dt>` / `<dd>` elements — `<dt>` is the term label, `<dd>` the value, stacked term-above-value.
- The spacing between pairs is overridable via the `--definitions-gap` hook.

A list of terms and their values. Renders a `<dl>`. Use it for facts about one thing, such as the details of an order.

**Things to know:**

- Put raw `<dt>` and `<dd>` elements inside it. `<dt>` is the term and `<dd>` is its value.
- Each term shows above its value. The term has the label style (small, bold, uppercase), the same as `<Label>`.
- `--definitions-gap` sets the space above each term, so it sets the space between pairs.
- Inside `<Prose>` a raw `<dl>` gets the same styles.
- Composes the `space`, `gap` and typography variants.

## Usage

### Details

```tsx live
import { Definitions } from "shelving/ui";

<Definitions>
	<dt>Name</dt>
	<dd>Acme Ltd</dd>
	<dt>Email</dt>
	<dd>hello@acme.example</dd>
	<dt>Plan</dt>
	<dd>Pro, billed yearly</dd>
</Definitions>;
```

### In a card

```tsx live
import { Card, Definitions, Subheading } from "shelving/ui";

<Card>
	<Subheading>Order 1042</Subheading>
	<Definitions>
		<dt>Status</dt>
		<dd>Shipped</dd>
		<dt>Total</dt>
		<dd>£48.00</dd>
	</Definitions>
</Card>;
```

## Styling

Override these hooks at `:root`. The tint hooks (`--definitions-color`, `--definitions-label-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                     | Styles                              | Default                         |
| ---------------------------- | ----------------------------------- | ------------------------------- |
| `--definitions-space`        | Outer block margin (top and bottom) | `var(--space-paragraph)` (16px) |
| `--definitions-gap`          | Space above each term               | `var(--space-small)` (12px)     |
| `--definitions-color`        | Value text colour                   | `var(--tint-00)`                |
| `--definitions-font`         | Value font family                   | `var(--font-body)`              |
| `--definitions-weight`       | Value font weight                   | `var(--weight-normal)` (400)    |
| `--definitions-size`         | Value font size                     | `var(--size-normal)` (16px)     |
| `--definitions-align`        | Text alignment                      | `left`                          |
| `--definitions-label-color`  | Term text colour                    | `var(--tint-70)`                |
| `--definitions-label-font`   | Term font family                    | `var(--font-label)`             |
| `--definitions-label-weight` | Term font weight                    | `var(--weight-label)` (700)     |
| `--definitions-label-size`   | Term font size                      | `var(--size-label)` (12.8px)    |
| `--definitions-label-case`   | Term text case                      | `var(--case-label)` (uppercase) |

**Global tokens it reads:** the tint ladder `--tint-00` / `--tint-70`, plus `--space-paragraph`, `--space-small`, `--font-body`, `--weight-normal`, `--size-normal`, and the label tokens `--font-label`, `--weight-label`, `--size-label`, `--case-label`.


## Signatures

```ts
Definitions({ children, className, ...props }: DefinitionsProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DefinitionsProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

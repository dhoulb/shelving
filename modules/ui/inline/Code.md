# Code

An inline code span — renders a `<code>` element with monospace type and a subtle tinted background. `Code.tsx` exports four siblings that share the same monospace styling but carry different HTML semantics:

| Component  | HTML element | Use for                         |
| ---------- | ------------ | ------------------------------- |
| `Code`     | `<code>`     | Inline code fragments           |
| `Keyboard` | `<kbd>`      | Keyboard input, e.g. `Ctrl+S`   |
| `Sample`   | `<samp>`     | Program output                  |
| `Variable` | `<var>`      | Variable names in documentation |

**Things to know:**

- Pick the sibling whose semantics match — they all look the same but mean different things to assistive tech and search.
- Pass `plain` to drop the default background and inline padding (useful when the code already sits inside a tinted container).
- Painted from the [tint ladder](/ui/TINT_CLASS): the background is [`--tint-90`](/ui/TINT_CLASS) and the text [`--tint-00`](/ui/TINT_CLASS), so it re-tints with its surrounding scope.
- Inside [`Prose`](/ui/Prose) raw `<code>` / `<kbd>` / `<samp>` / `<var>` pick up the same styling, and code inside a `<pre>` drops the inline box automatically.

## Usage

### Inline code and keyboard input

```tsx
import { Code, Keyboard, Sample } from "shelving/ui";

<p>Run <Code>npm install</Code>, then press <Keyboard>Enter</Keyboard>.</p>
<p>It prints <Sample>Done.</Sample></p>
```

### Plain (no background)

```tsx
import { Code } from "shelving/ui";

<Code plain>const x = 1;</Code>
```

## Styling

`Code` paints from the [tint ladder](/ui/TINT_CLASS); the box (`background` / `color`) reads ladder steps directly, while type, padding, and radius have per-property hooks.

| Variable | Styles | Default |
|---|---|---|
| `--code-font` | Font family | `var(--font-code)` |
| `--code-weight` | Font weight | `var(--weight-code)` |
| `--code-size` | Font size | `var(--size-smaller)` |
| `--code-leading` | Line height | `var(--leading)` |
| `--code-padding` | Inline padding (non-`plain`) | `var(--space-xxsmall)` |
| `--code-radius` | Corner radius (non-`plain`) | `var(--radius-xxsmall)` |

**Global tokens it reads:** [`--font-code`](/ui/getFontClass), [`--weight-code`](/ui/getWeightClass), [`--size-smaller`](/ui/getSizeClass), [`--leading`](/ui/getSizeClass), [`--space-xxsmall`](/ui/getSpaceClass), [`--radius-xxsmall`](/ui/getRadiusClass), and the tint-ladder steps [`--tint-00`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS) for the box fill and text.

# getWidthClass

The `width` variant prop (`"narrow"`, `"normal"`, `"wide"`, `"full"`, `"fit"`) constrains a block-level component's max-inline-size — `<Card width="narrow">`, `<Block width="wide">`. It's an **override** for one-off layout; for an app-wide change, retune the width variables below in a theme file. `Section` already defaults to the `--width-normal` constraint, so most pages never set `width` at all.

`getWidthClass({ width })` maps the prop to a width class. The `narrow`, `normal`, and `wide` constraints read the variables below; `full` takes the full available width and `fit` shrinks to the content.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--width-narrow` | `35rem` | The `narrow` constraint — single-column forms, dialogs. |
| `--width-normal` | `55rem` | The `normal` constraint — standard content column. |
| `--width-wide` | `75rem` | The `wide` constraint — readable prose measure. |

## See also

- [`ui`](/ui) — the styling-system overview and the full list of base token pages.

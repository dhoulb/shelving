# getWidthClass

The width variant props (`narrow`, `wide`, `full`, `fit`) constrain a block-level component's max-inline-size — `<Section narrow>`, `<Card wide>`. They're **overrides** for one-off layout; for an app-wide change, retune the width variables below in a theme file.

`getWidthClass({ narrow, wide, full })` maps the boolean props to a width class. The `narrow` and `wide` constraints read the variables below.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--width-narrow` | `22.5rem` | The `narrow` constraint — single-column forms, dialogs. |
| `--width-wide` | `33.75rem` | The `wide` constraint — readable prose measure. |

## See also

- [`ui`](/ui) — the styling-system overview and the full list of base token pages.

# getShadowClass

This module's main job is to **define and document the elevation drop-shadow design tokens**. Components read these tokens directly; `getShadowClass({ shadow })` exists as a utility (e.g. `shadow="large"` → `shadow-large`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app. Each step deepens both blur and offset for a consistent elevation ramp.

| Variable | Default |
|---|---|
| `--shadow-xxsmall` | `0 0.125rem 0.5rem -0.25rem #0006` |
| `--shadow-xsmall` | `0 0.25rem 1rem -0.5rem #0006` |
| `--shadow-small` | `0 0.375rem 1.5rem -0.75rem #0006` |
| `--shadow-normal` | `0 0.5rem 2rem -1rem #0006` |
| `--shadow-large` | `0 0.75rem 3rem -1.5rem #0006` |
| `--shadow-xlarge` | `0 1rem 4rem -2rem #0006` |
| `--shadow-xxlarge` | `0 1.5rem 6rem -3rem #0006` |

## See also

- [`getRadiusClass`](/ui/getRadiusClass) — corner-radius tokens.
- [`getStrokeClass`](/ui/getStrokeClass) — border-thickness tokens.
- [`shelving/ui`](/ui) — the styling-system overview and the full list of base token pages.

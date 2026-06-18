# getRadiusClass

This module's main job is to **define and document the corner-radius design tokens**. Components don't take a `radius` prop — they read these tokens directly and expose their own per-component hooks (`--card-radius`, `--button-radius`, …) for surgical overrides. `getRadiusClass({ radius })` exists as a utility (e.g. `radius="large"` → `radius-large`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app. Every step derives from `--radius`, so changing that one value reflows the whole ramp.

| Variable | Default | Notes |
|---|---|---|
| `--radius` | `1rem` | Base radius — the root of the scale. |
| `--radius-xxsmall` | `calc(var(--radius) * 0.25)` | 4px |
| `--radius-xsmall` | `calc(var(--radius) * 0.5)` | 8px |
| `--radius-small` | `calc(var(--radius) * 0.75)` | 12px |
| `--radius-normal` | `calc(var(--radius) * 1)` | 16px |
| `--radius-large` | `calc(var(--radius) * 1.5)` | 24px |
| `--radius-xlarge` | `calc(var(--radius) * 2)` | 32px |
| `--radius-xxlarge` | `calc(var(--radius) * 3)` | 48px |

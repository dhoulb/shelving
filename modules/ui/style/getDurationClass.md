# getDurationClass

This module's main job is to **define and document the transition/animation timing tokens**. Components and [`<Transition>`](/ui/Transition) components read these tokens directly; `getDurationClass({ duration })` exists as a utility (e.g. `duration="fast"` → `duration-fast`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--duration-fast` | `150ms` | Snappy UI feedback — hovers, small toggles. |
| `--duration-normal` | `300ms` | Default transitions. |
| `--duration-slow` | `600ms` | Deliberate, large movements. |

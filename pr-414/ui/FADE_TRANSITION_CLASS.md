# FADE_TRANSITION_CLASS

- Kind: constant
- Import: `import { FADE_TRANSITION_CLASS } from "shelving/ui";`

View transition class that fades content in and out.

- Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
- Also adds the plain global `fade` class, so app CSS can target it with `::view-transition-group(.fade)`.

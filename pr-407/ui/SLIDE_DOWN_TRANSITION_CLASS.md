# SLIDE_DOWN_TRANSITION_CLASS

- Kind: constant
- Import: `import { SLIDE_DOWN_TRANSITION_CLASS } from "shelving/ui";`

View transition class that slides content down: the new content comes in from the top and the old content leaves to the bottom.

- Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
- Also adds the plain global `slide-down` class, so app CSS can target it with `::view-transition-group(.slide-down)`.

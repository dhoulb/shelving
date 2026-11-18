# SLIDE_RIGHT_TRANSITION_CLASS

- Kind: constant
- Import: `import { SLIDE_RIGHT_TRANSITION_CLASS } from "shelving/ui";`

View transition class that slides content right: the new content comes in from the right and the old content leaves to the left.

- Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
- Also adds the plain global `slide-right` class, so app CSS can target it with `::view-transition-group(.slide-right)`.

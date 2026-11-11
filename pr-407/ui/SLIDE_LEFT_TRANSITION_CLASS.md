# SLIDE_LEFT_TRANSITION_CLASS

- Kind: constant
- Import: `import { SLIDE_LEFT_TRANSITION_CLASS } from "shelving/ui";`

View transition class that slides content left: the new content comes in from the left and the old content leaves to the right.

- Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
- Also adds the plain global `slide-left` class, so app CSS can target it with `::view-transition-group(.slide-left)`.

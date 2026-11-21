# SLIDE_UP_TRANSITION_CLASS

- Kind: constant
- Import: `import { SLIDE_UP_TRANSITION_CLASS } from "shelving/ui";`

View transition class that slides content up: the new content comes in from the bottom and the old content leaves to the top.

- Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
- Also adds the plain global `slide-up` class, so app CSS can target it with `::view-transition-group(.slide-up)`.

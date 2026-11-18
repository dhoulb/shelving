# NavigationPositionContext

- Kind: constant
- Import: `import { NavigationPositionContext } from "shelving/ui";`

React context holding where the app is in its stacks, published by `<Navigation>` with each URL change.
- `undefined` without the browser Navigation API, during a server render, or outside `<Navigation>`.
- `<RouteCache>`, `<Router>` and `<BackButton>` read it, so they change in the same render as the URL.

# LoadingIcon

- Kind: constant
- Import: `import { LoadingIcon } from "shelving/icon/LoadingIcon";`

Animated icon that shows something is loading, e.g. `<Icon status="loading">` and `LOADING`.
- Default is shelving's own `<Loading>` spinner.
- Swap it for your own icon with a `paths` entry for `shelving/icon/LoadingIcon` in your `tsconfig.json`. See `README.md` in this folder.
- An icon has no CSS of its own, so animate your icon inside the SVG, e.g. with SMIL `<animateTransform>`.

# Route

- Kind: type
- Import: `import { Route } from "shelving/ui";`

Valid route values:
- `RouteComponent` — rendered as `<Component {...params}/>` with merged placeholder + query params.
- `AbsolutePath` string — triggers a redirect to that path.
- `ReactElement` — rendered as-is (use for layout-wrapping a nested `<Router>` inside).

## Signatures

```ts
RouteComponent | AbsolutePath | ReactElement
```

## Types

- [RouteComponent](RouteComponent.md): React component usable as a route value — a function or class component accepting RouteProps.
- [AbsolutePath](../util/path/AbsolutePath.md): Absolute path string starting with a / slash.
- `ReactElement`

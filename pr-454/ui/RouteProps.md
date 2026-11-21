# RouteProps

- Kind: type
- Import: `import { RouteProps } from "shelving/ui";`

Props for a component that works as a route in the router.
- Combines `?query` params from the URL and `{placeholder}` matches from the route template into one flat string dictionary.
- Template placeholder values take precedence over query params with the same name.

## Signatures

```ts
URIParams
```

## Types

- [URIParams](../util/uri/URIParams.md): Type for a set of named URI parameters.

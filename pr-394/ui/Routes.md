# Routes

- Kind: type
- Import: `import { Routes } from "shelving/ui";`

Route table mapping `{ path: RouteComponent | redirectPath | ReactElement }` for a `<Router>`.

- Each key is a path starting with `/`, optionally containing `{named}` placeholders passed into the component.
- Each value is a `Route` (or a nullish/`false` value to disable that route).

## Signatures

```ts
{
	[key: AbsolutePath]: Nullish<Route | false>;
}
```

## Types

- [AbsolutePath](../util/path/AbsolutePath.md): Absolute path string starting with a / slash.
- [Nullish](../util/null/Nullish.md): Nullish is the value or null or undefined.
- [Route](Route.md): Valid route values:

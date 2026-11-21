# RouterProps

- Kind: interface
- Import: `import { RouterProps } from "shelving/ui";`
- Extends: `PossibleMeta`

Props for `<Router>` — the `routes` to match against plus an optional `fallback`.

## Signatures

```ts
{
	readonly routes: Routes;
	readonly fallback?: ReactElement | undefined | null;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `routes` | `Routes` | List of routes for the router to match against. Read only. |
| `fallback` | `ReactElement \| undefined \| null` | Optional fallback element. - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`). Read only. Optional. |

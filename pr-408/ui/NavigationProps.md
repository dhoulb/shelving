# NavigationProps

- Kind: interface
- Import: `import { NavigationProps } from "shelving/ui";`
- Extends: `PossibleMeta`

Props for `<Navigation>`: the initial `Meta` (url, root and stack), the `stacks`, and optional `children`.

## Signatures

```ts
{
	readonly stacks?: readonly AbsolutePath[] | undefined;
	readonly stack?: AbsolutePath | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `stacks` | `readonly AbsolutePath[] \| undefined` | Root path of each stack, in tab order, for an app with a tab bar (for example `["/home", "/discover", "/profile"]`). - Each stack keeps its own pages, so each tab remembers where you left it, and a back button goes back within its tab. - With no stacks, the app has one stack at `"/"`, and `stack` in `Meta` is `"/"`. Read only. Optional. |
| `stack` | `AbsolutePath \| undefined` | Stack of the page the app opens at (for example `"/home"`), like `url` and `root`. - Read from this prop, else from the surrounding `<Meta>`, else `"/"`. - Used only when the opening history entry has no saved stack. A reload keeps the stack it had. Read only. Optional. |

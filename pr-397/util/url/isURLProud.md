# isURLProud()

- Kind: function
- Import: `import { isURLProud } from "shelving/util/url";`

Is a target URL proud relative to a base URL?
- Proud means `target` is `base` or a descendant of `base` — i.e. `base` is at or above `target` in the URL hierarchy.
- Useful for marking a menu item as "current branch" when the user is somewhere deeper in its sub-tree.
- Origin mismatches return `false`.

## Signatures

```ts
isURLProud(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = isURLProud): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleURL \| undefined` | URL whose status to test — relative paths resolve against `base`. |
| `base` | `PossibleURL \| undefined` | Base URL to test against. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to — defaults to `isURLProud`. Defaults to `isURLProud`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` is `base` or a descendant of `base`, otherwise `false`. |

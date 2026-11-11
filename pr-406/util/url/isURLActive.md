# isURLActive()

- Kind: function
- Import: `import { isURLActive } from "shelving/util/url";`

Is a target URL active relative to a base URL?
- Active means `target` and `base` resolve to the exact same URL (same origin, same path).
- Origin mismatches return `false`.

## Signatures

```ts
isURLActive(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = isURLActive): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleURL \| undefined` | URL whose status to test — relative paths resolve against `base`. |
| `base` | `PossibleURL \| undefined` | Base URL to test against. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to — defaults to `isURLActive`. Defaults to `isURLActive`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` resolves to exactly the same URL as `base`, otherwise `false`. |

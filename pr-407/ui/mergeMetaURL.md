# mergeMetaURL()

- Kind: function
- Import: `import { mergeMetaURL } from "shelving/ui";`

Merge a new metadata URL onto the current one, resolving it and applying params.

- New URL is resolved relative to the `base` URL, falling back to `current` when unset.

## Signatures

```ts
mergeMetaURL(base: ImmutableURL | undefined, current: ImmutableURL | undefined, next: PossibleURL | undefined, params: PossibleURIParams | undefined, caller: AnyCaller = mergeMetaURL): ImmutableURL | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base` | `ImmutableURL \| undefined` | Base URL to resolve `next` against. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `current` | `ImmutableURL \| undefined` | The current URL, used when `next` is unset. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `next` | `PossibleURL \| undefined` | The new (possibly relative) URL to resolve. |
| `params` | `PossibleURIParams \| undefined` | URI params to set on the resolved URL (replaces existing params). |
| `caller` | `AnyCaller` | Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaURL`). Defaults to `mergeMetaURL`. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL \| undefined` | The resolved URL, or `undefined` if neither `next` nor `current` was set. |

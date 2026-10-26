# requireURL()

- Kind: function
- Import: `import { requireURL } from "shelving/util/url";`

Convert a possible URL to a URL, or throw `RequiredError` if conversion fails.

## Signatures

```ts
requireURL(target: PossibleURL, base?: PossibleURL, caller: AnyCaller = requireURL): ImmutableURL
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleURL` | URL string, URL object, or path to resolve. |
| `base` | `PossibleURL` | Base URL to resolve a relative `target` against. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to — defaults to `requireURL`. Defaults to `requireURL`. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL` | Resolved `ImmutableURL`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If `target` cannot be resolved to a true `scheme://host` URL. |

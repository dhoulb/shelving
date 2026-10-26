# formatURL()

- Kind: function
- Import: `import { formatURL } from "shelving/util/format";`

Format a URL as a user-friendly string.
- e.g. `http://shax.com/test?uid=129483` → `shax.com/test`

## Signatures

```ts
formatURL(url: PossibleURL, base?: PossibleURL, caller: AnyCaller = formatURL): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURL` | URL to format. |
| `base` | `PossibleURL` | Base URL to resolve `url` against if it is relative. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatURL` itself). Defaults to `formatURL`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Friendly string showing the host and path with any trailing slash removed. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `url` cannot be converted to a valid URL. |

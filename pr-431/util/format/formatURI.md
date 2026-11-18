# formatURI()

- Kind: function
- Import: `import { formatURI } from "shelving/util/format";`

Format a URI as a user-friendly string.
- e.g. `mailto:dave@shax.com` → `dave@shax.com`
- e.g. `http://shax.com/test?uid=129483` → `shax.com/test`

## Signatures

```ts
formatURI(url: PossibleURI, caller: AnyCaller = formatURI): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURI` | URI to format. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatURI` itself). Defaults to `formatURI`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Friendly string showing the host and path with any trailing slash removed. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `url` cannot be converted to a valid URI. |

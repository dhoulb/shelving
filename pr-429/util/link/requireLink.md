# requireLink()

- Kind: function
- Import: `import { requireLink } from "shelving/util/link";`

Resolve a possible link to an absolute URI string, or throw `RequiredError` if resolution fails.

Same classification and defaults as `getLink()`. Use when an absolute URI is required and there's no sensible "do nothing" path for the caller.

## Signatures

```ts
requireLink(href: PossibleLink, url?: ImmutableURL, root?: ImmutableURL, caller: AnyCaller = requireLink): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `href` | `PossibleLink` | The link to resolve. |
| `url` | `ImmutableURL` | The current page URL — base for relative refs and scheme-prefixed URIs. Optional. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `root` | `ImmutableURL` | The site root URL — base for absolute paths. Defaults to `url`. Optional. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireLink` itself). Defaults to `requireLink`. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURI` | An absolute URI string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `href` cannot be resolved. |

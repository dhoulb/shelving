# getLink()

- Kind: function
- Import: `import { getLink } from "shelving/util/link";`

Resolve a possible link to an absolute URI string, or return `undefined` if resolution fails.

Classification:
- **`URL` instance** → returns its `.href` directly.
- **Absolute path** (single leading `/`, e.g. `/schema`) → resolved against `root` with a dot prefix so the resolution honors `root`'s subfolder — `/schema` against `https://x.com/app/` becomes `https://x.com/app/schema`, not `https://x.com/schema`.
- **Anything else** — relative ref (`./foo`, `../foo`, `foo`, `#anchor`, `?q`), protocol-relative URL (`//host/path`), or scheme-prefixed URI (`mailto:a@b`, `tel:123`, `https://x.com/y`) → fed to `getBasedURI()` with `url` as the base. Self-contained URIs ignore the base (their own scheme makes them absolute); protocol-relative and relative refs resolve against the page URL.

Defaults:
- `root` defaults to `url`, so passing only `url` makes absolute paths resolve under the page URL's directory (same coordinate space the page lives in).
- When both are omitted, all branches return `undefined` (no base to resolve against).

Bases are passed through to `getURL()` / `getBasedURI()` lazily — neither `url` nor `root` is materialised into a normalised base until the chosen branch needs it.

## Signatures

```ts
getLink(href: Nullish<PossibleLink>, url?: ImmutableURL, root: ImmutableURL | undefined = url): ImmutableURI | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `href` | `Nullish<PossibleLink>` | The link to resolve. Strings are classified by shape; `URL` instances pass through. |
| `url` | `ImmutableURL` | The current page URL — base for relative refs and scheme-prefixed URIs. Optional. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `root` | `ImmutableURL \| undefined` | The site root URL — base for absolute paths. Defaults to `url`. Defaults to `url`. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURI \| undefined` | An absolute URI object, or `undefined` if `link` is missing, not a string/URL, or cannot be resolved. |

# AUTOLINK_RULE

- Kind: constant
- Import: `import { AUTOLINK_RULE } from "shelving/markup";`

Autolinked URL starts with `scheme:` (any scheme in `MarkupOptions.schemes`) and matches an unlimited number of non-space characters.
- If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
- If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
- If link is not valid (using `new URL(url)` then unparsed text will be returned.
- For security only schemes that appear in `MarkupOptions.schemes` will match (defaults to `http:` and `https:`).

## Examples

```ts
new MarkupParser({ rules: [AUTOLINK_RULE] }).parse("http://google.com/maps (Google Maps)")
```

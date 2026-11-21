# MarkupParser.getLink()

- Kind: method
- Member of: `MarkupParser`

Resolve a link href against this parser's `url` and `root`, returning it only if its scheme is allowed.

## Signatures

```ts
getLink(href: Nullish<PossibleLink>): ImmutableURI | undefined
```

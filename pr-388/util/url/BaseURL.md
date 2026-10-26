# BaseURL

- Kind: interface
- Import: `import { BaseURL } from "shelving/util/url";`
- Extends: `ImmutableURL`

BaseURL is a URL with a guaranteed trailing slash on pathname.

## Signatures

```ts
{
	readonly pathname: `/` | `/${string}/`;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `pathname` | `` `/` \| `/${string}/` `` | Read only. |

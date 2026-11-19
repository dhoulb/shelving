# getBaseURL()

- Kind: function
- Import: `import { getBaseURL } from "shelving/util/url";`

Get a Base URL — a true URL whose `pathname` is normalised to end in a trailing slash.
- Falsy or non-URL input returns `undefined`.
- A URL without a trailing slash is cloned and given one (the input is never mutated).

## Signatures

```ts
getBaseURL(input: Nullish<PossibleURL>): BaseURL | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `Nullish<PossibleURL>` | URL string, URL object, or path to normalise. |

## Returns

| Type | Description |
| --- | --- |
| `BaseURL \| undefined` | `BaseURL` with a trailing-slash pathname, or `undefined` if `input` is not a true URL. |

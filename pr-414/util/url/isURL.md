# isURL()

- Kind: function
- Import: `import { isURL } from "shelving/util/url";`

Is an unknown value a URL object?
- Must be a `URL` instance and its origin must start with `scheme://`

## Signatures

```ts
isURL(value: unknown): value is ImmutableURL
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Unknown value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableURL` | `true` if `value` is a true `scheme://host` URL object, otherwise `false`. |

# joinMetaCSP()

- Kind: function
- Import: `import { joinMetaCSP } from "shelving/ui";`

Turn a deconstructed `MetaCSP` into a `Content-Security-Policy` string.

## Signatures

```ts
joinMetaCSP(csp: Nullish<MetaCSP>): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `csp` | `Nullish<MetaCSP>` | The CSP to join, as a `{ resource: string[] }` object or a ready-made string. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The joined CSP string, or `undefined` if `csp` was nullish. |

## Examples

```ts
joinMetaCSP({ "default-src": ["'self'"], "img-src": ["*"] }) // "default-src 'self'; img-src *"
```

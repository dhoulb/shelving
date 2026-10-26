# TokenClaims

- Kind: interface
- Import: `import { TokenClaims } from "shelving/util/jwt";`
- Extends: `Data`

Claims payload accepted when encoding a JWT.
- Extends `Data`, so any additional custom claims may be included alongside the standard `iat` / `nbf` / `exp` fields.

## Signatures

```ts
{
	readonly iat?: PossibleDate;
	readonly nbf?: PossibleDate;
	readonly exp?: number;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `iat` | `PossibleDate` | "Issued at" date (defaults to "now"). - Not used for validation, but always set in the token payload. - Can be used to determine when the token was issued, and possibly revoke tokens issued before a certain date. Read only. Optional. |
| `nbf` | `PossibleDate` | "Not before" date. - When validating the token, tokens before this date will be rejected Read only. Optional. |
| `exp` | `number` | Expiry in milliseconds (defaults to "30 days"). - When validating the token, tokens after this date will be rejected Read only. Optional. |

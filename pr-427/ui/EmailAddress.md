# EmailAddress

- Kind: component
- Import: `import { EmailAddress } from "shelving/ui";`

Show an optional email address string correctly on screen.
- Renders an optional `name` in bold, followed by a `mailto:` link; shows "No email" when `email` is empty.

## Signatures

```ts
EmailAddress({ name, email, className }: EmailAddressProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `EmailAddressProps` |  |
| `.name` | `Nullish<string>` | Optional. |
| `.email` | `Nullish<string>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<EmailAddress name="Acme" email="hi@example.com" />
```

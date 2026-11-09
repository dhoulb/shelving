# Address()

- Kind: function
- Import: `import { Address } from "shelving/ui";`

Show any kind of contact data, rendered as an `<address>`.

## Signatures

```ts
Address({ children, className, ...props }: AddressProps): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `AddressProps` |  |

## Examples

```ts
<Address><Strong>Acme</Strong>{"\n"}1 Example St</Address>
```

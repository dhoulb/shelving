# ADDRESS

- Kind: constant
- Import: `import { ADDRESS } from "shelving/schema";`

Sugar instance of `AddressSchema` for postal address data. Equivalent to `new AddressSchema({})`.

## Examples

```ts
ADDRESS.validate({ address1: "1 High St", city: "London", postcode: "SW1A 1AA", country: "GB" });
```

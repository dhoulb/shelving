# PhysicalAddress

- Kind: component
- Import: `import { PhysicalAddress } from "shelving/ui";`

Show an optional `AddressData` object correctly on screen.
- Renders an optional `name` in bold, followed by the formatted address; shows "No address" when `address` is empty.

## Signatures

```ts
PhysicalAddress({ name, address, className }: PhysicalAddressProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PhysicalAddressProps` |  |
| `.name` | `Nullish<string>` | Optional. |
| `.address` | `Nullish<AddressData>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<PhysicalAddress name="Acme" address={addressData} />
```

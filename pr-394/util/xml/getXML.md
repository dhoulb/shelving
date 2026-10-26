# getXML()

- Kind: function
- Import: `import { getXML } from "shelving/util/xml";`

Build an XML string from a data object.

- Only data objects can be converted directly because XML requires named root and child elements.
- `undefined` values are omitted from the output.
- Nested data objects become nested XML elements.

## Signatures

```ts
getXML(data: Data, caller: AnyCaller = getXML): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `Data` | The data object to serialize. |
| `caller` | `AnyCaller` | Function to attribute thrown errors to (defaults to `getXML`). Defaults to `getXML`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The serialized XML string. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if a key is not a valid XML element name. |
| `unknown` | `RequiredError` if a value cannot be converted to XML. |

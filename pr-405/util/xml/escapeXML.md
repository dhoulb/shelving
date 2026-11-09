# escapeXML()

- Kind: function
- Import: `import { escapeXML } from "shelving/util/xml";`

Escape a string for safe inclusion in XML text content or attribute values.

- Replaces `&`, `<`, `>`, `"`, and `'` with their XML entity equivalents.

## Signatures

```ts
escapeXML(value: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The raw string value. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The escaped XML-safe string. |

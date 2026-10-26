# getFlexClass()

- Kind: function
- Import: `import { getFlexClass } from "shelving/ui";`

Get the flex layout class for a component from its flex variant props.

## Signatures

```ts
getFlexClass(variants: FlexVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `FlexVariants` |  |
| `.wrap` | `boolean \| undefined` | Wrap overflowing elements onto the next line. Optional. |
| `.nowrap` | `boolean \| undefined` | Overflowing elements _do not_ wrap onto the next line. Optional. |
| `.column` | `boolean \| undefined` | Display the elements as a column (defaults to row). Optional. |
| `.reverse` | `boolean \| undefined` | Reverse the order of the elements. Optional. |
| `.stretch` | `boolean \| undefined` | Rows: Justify the elements across to stretch across the full width (this is the default for rows) (primary axis). Columns: Justify the elements across to stretch across the full height (this is the default for columns) (primary axis). Optional. |
| `.between` | `boolean \| undefined` | Rows: Justify the elements with space between them (primary axis). Columns: Justify the elements with space between them (primary axis). Optional. |
| `.around` | `boolean \| undefined` | Rows: Justify the elements with space around them (primary axis). Columns: Justify the elements with space around them (primary axis). Optional. |
| `.left` | `boolean \| undefined` | Rows: Justify the elements to the left (primary axis). Columns: Align the elements to the left (secondary axis). Optional. |
| `.center` | `boolean \| undefined` | Rows: Justify the elements to the center (primary axis). Columns: Align the elements to the center (secondary axis). Optional. |
| `.right` | `boolean \| undefined` | Rows: Justify the elements to the right (primary axis). Columns: Align the elements to the right (secondary axis). Optional. |
| `.top` | `boolean \| undefined` | Rows: Align the elements to the top (secondary axis). Columns: Justify the elements to the top (primary axis). Optional. |
| `.middle` | `boolean \| undefined` | Rows: Align the elements to the middle (secondary axis). Columns: Justify the elements to the middle (primary axis). Optional. |
| `.bottom` | `boolean \| undefined` | Rows: Align the elements to the bottom (secondary axis). Columns: Justify the elements to the bottom (primary axis). Optional. |
| `.baseline` | `boolean \| undefined` | Rows: Align the text baselines of the elements (in rows or columns) Columns: Not-applicable, has no effect. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined flex + gap class string. |

## Examples

```ts
getFlexClass({ column: true, center: true, gap: "large" })
```

# Scroll

- Kind: component
- Import: `import { Scroll } from "shelving/ui";`

Wrap children in a scrollable container with horizontal and/or vertical scrolling enabled.

## Signatures

```ts
Scroll({ children, ...props }: ScrollComponentProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ScrollComponentProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<div>` element with the computed scroll class. |

## Examples

```ts
<Scroll horizontal>{wideContent}</Scroll>
```

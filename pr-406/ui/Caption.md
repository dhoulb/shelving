# Caption

- Kind: component
- Import: `import { Caption } from "shelving/ui";`

`<figcaption>` block — caption text for a `<Figure>`.

## Signatures

```ts
Caption({ children, className, ...props }: CaptionProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `CaptionProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Figure><Image src="/cat.jpg" /><Caption>A cat</Caption></Figure>
```

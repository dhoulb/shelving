# Image

- Kind: component
- Import: `import { Image } from "shelving/ui";`

Image block — renders an `<img>` with space and width variants applied.
- It loads `lazy`. React holds a transition (such as a page change) until each eager `<img>` loads, so an eager image would delay the whole page.

## Signatures

```ts
Image({ src, alt, className, ...props }: ImageProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ImageProps` |  |
| `.src` | `string` |  |
| `.alt` | `string` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Image src="/logo.png" alt="Logo" width="narrow" />
```

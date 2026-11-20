# Image

- Kind: component
- Import: `import { Image } from "shelving/ui";`

Image block — renders an `<img>` with space and width variants applied.
- It loads `lazy`, and fades in once when it loads. An image that is already loaded when it mounts shows at once.
- It never holds a transition (such as a page change): React waits only for an eager `<img>` with no `onLoad`.
- The load state is the `data-loaded` attribute (none, `fade`, then `done`), set on the element directly, so a load never re-renders.

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

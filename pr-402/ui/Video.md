# Video

- Kind: component
- Import: `import { Video } from "shelving/ui";`

Video container element.
- Has a black background and a 16:9 aspect ratio.
- Shows its contents (i.e. a `<video>` element or a `<TwilioRoom>`).

## Signatures

```ts
Video({ children, className, ...props }: VideoProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `VideoProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Video><video src="/clip.mp4" /></Video>
```

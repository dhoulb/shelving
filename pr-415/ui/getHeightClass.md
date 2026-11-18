# getHeightClass()

- Kind: function
- Import: `import { getHeightClass } from "shelving/ui";`

Get the height class for a component from its `height`, `top`, `middle` and `bottom` variant props.

The `height` variant prop sets a component's minimum block size, and `top` / `middle` / `bottom` set where its content sits inside that height — `<Block height="full" middle>`, `<Section height="12x" bottom>`. It is the vertical partner of the `width` variant (see `getWidthClass()`).

`getHeightClass({ height, top, middle, bottom })` maps the props to height classes.

**Values:**

- `full` — at least the full height of the container, for example a layout's `<Scroll vertical cover>` box.
- `1x` / `2x` / `3x` / `4x` / `5x` / `6x` / `7x` / `8x` / `10x` / `12x` / `16x` / `20x` / `24x` / `28x` / `32x` — at least a multiple of `--space-normal`.

**Things to know:**

- Every height is a minimum (`min-block-size`). When the content is taller, the element grows, so a scroll box scrolls it from the top and nothing is cut off.
- `top` (the default), `middle` and `bottom` set `align-content` on the element itself. The element keeps its own `display`, so its parent does not need to be a flex box. They only do something when the element is taller than its content, so use them with `height`.
- `<Row>` and `<Column>` already have `top` / `middle` / `bottom` flex variants with the same meaning, so `<Column height="full" middle>` also puts its items in the middle (see `getFlexClass()`).
- In a flex or grid container, `space="auto"` is the other way to centre a block (see `getSpaceClass()`).
- `align-content` on a plain block shipped in Chrome 123, Firefox 125 and Safari 17.4. Older browsers show the content at the top.

## Usage

A log-in screen, in the middle of a layout's scroll box:

```tsx
<Page title="Log in">
  <Block height="full" middle width="narrow" padding="xxlarge" indent="normal">
    <LoginForm />
  </Block>
</Page>
```


## Signatures

```ts
getHeightClass({ height, top, middle, bottom }: HeightVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `HeightVariants` |  |
| `.height` | `HeightVariant \| undefined` | Height of the element. It is a minimum, so the element grows when its content is taller. Optional. |
| `.top` | `boolean \| undefined` | Put the content at the top of the element (the default). Optional. |
| `.middle` | `boolean \| undefined` | Put the content in the vertical middle of the element. Use with `height`. Optional. |
| `.bottom` | `boolean \| undefined` | Put the content at the bottom of the element. Use with `height`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The height class string, or `undefined` if no height variants are set. |

## Examples

```ts
getHeightClass({ height: "full", middle: true }) // "height height-full middle"
```

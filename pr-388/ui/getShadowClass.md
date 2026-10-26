# getShadowClass()

- Kind: function
- Import: `import { getShadowClass } from "shelving/ui";`

Get the drop-shadow class for a component from its `shadow` variant prop.

This module's main job is to **define and document the elevation drop-shadow design tokens**. Components read these tokens directly; `getShadowClass({ shadow })` exists as a utility (e.g. `shadow="large"` → `shadow-large`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app. The scale is [Tailwind's](https://tailwindcss.com/docs/box-shadow) `shadow-md`, `shadow-lg` and `shadow-xl` with half the Y offset, so a sliver of shadow always shows at the top. Each shadow has two layers of `--shadow-color`. Both layers have a negative spread, so no dark line shows under the bottom edge.

| Variable | Default | Used by |
|---|---|---|
| `--shadow-color` | `#0003` (20% black) | Every layer of every shadow below. |
| `--shadow-small` | `0 2px 6px -1px`, `0 1px 4px -2px` | `<Popover>` |
| `--shadow-normal` | `0 5px 15px -3px`, `0 2px 6px -4px` | Floating `<Notices>` |
| `--shadow-large` | `0 10px 25px -5px`, `0 4px 10px -6px` | `<Modal>`, the open `<SidebarLayout>` drawer |

The table shows the values in pixels. The source uses `rem`.

The `shadow=` variant prop accepts `"none"`, `"small"`, `"normal"`, or `"large"` — `"none"` removes a component's default shadow rather than mapping to a token.


## Signatures

```ts
getShadowClass({ shadow }: ShadowVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ShadowVariants` |  |
| `.shadow` | `ShadowVariant \| undefined` | Drop shadow of the element. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The shadow class string, or `undefined` when no `shadow` is set. |

## Examples

```ts
getShadowClass({ shadow: "large" }) // "shadow-large"
```

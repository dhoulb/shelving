# getStrokeClass()

- Kind: function
- Import: `import { getStrokeClass } from "shelving/ui";`

Get the border-thickness class for a component from its `stroke` variant prop.

This module's main job is to **define and document the border-thickness design tokens**. Components don't take a `stroke` prop — they hard-code to these tokens and expose their own per-component hooks (`--button-stroke`, `--card-border`, …) for overrides. `getStrokeClass({ stroke })` exists as a utility (e.g. `stroke="thick"` → `stroke-thick`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--stroke` | `2px` | Base border thickness — the root of the scale. |
| `--stroke-normal` | `calc(var(--stroke) * 1)` | Default borders. |
| `--stroke-thick` | `calc(var(--stroke) * 1.5)` | Heavier borders. |
| `--stroke-focus` | `var(--stroke-thick)` | Focus-outline thickness. |


## Signatures

```ts
getStrokeClass({ stroke }: StrokeVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `StrokeVariants` |  |
| `.stroke` | `StrokeVariant \| undefined` | Border thickness of the component. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The stroke class string, or `undefined` when no `stroke` is set. |

## Examples

```ts
getStrokeClass({ stroke: "thick" }) // "stroke-thick"
```

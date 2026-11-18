# getDurationClass()

- Kind: function
- Import: `import { getDurationClass } from "shelving/ui";`

Get the transition-duration class for a component from its `duration` variant prop.

This module's main job is to **define and document the transition/animation timing tokens**. Components and `<Transition>` components read these tokens directly; `getDurationClass({ duration })` exists as a utility (e.g. `duration="fast"` → `duration-fast`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--duration-fast` | `150ms` | Snappy UI feedback — hovers, small toggles. |
| `--duration-normal` | `300ms` | Default transitions. |
| `--duration-slow` | `600ms` | Deliberate, large movements. |


## Signatures

```ts
getDurationClass({ duration }: DurationVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `DurationVariants` |  |
| `.duration` | `DurationValue \| undefined` | Transition duration of the element. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The duration class string, or `undefined` when no `duration` is set. |

## Examples

```ts
getDurationClass({ duration: "fast" }) // "duration-fast"
```

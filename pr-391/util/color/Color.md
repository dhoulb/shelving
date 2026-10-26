# Color

- Kind: class
- Import: `import { Color } from "shelving/util/color";`

Represents an RGBA color with red, green, blue, and alpha channels (each `0`–`255`).

## Signatures

```ts
new Color(r = 255, g = 255, b = 255, a = 255)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `r` | `unknown` | Defaults to `255`. |
| `g` | `unknown` | Defaults to `255`. |
| `b` | `unknown` | Defaults to `255`. |
| `a` | `unknown` | Defaults to `255`. |

## Returns

| Type | Description |
| --- | --- |
| `Color` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `r` | `number` | Red channel, bounded to `0`–`255`. Read only. |
| `g` | `number` | Green channel, bounded to `0`–`255`. Read only. |
| `b` | `number` | Blue channel, bounded to `0`–`255`. Read only. |
| `a` | `number` | Alpha channel, bounded to `0`–`255`. Read only. |
| `hex` | `string` | This color as a six or eight digit hex string (eight digits when the alpha channel is less than `255`). Read only. |
| `rgb` | `string` | This color as a CSS `rgb()` string. Read only. |
| `rgba` | `string` | This color as a CSS `rgba()` string. Read only. |
| `luminance` | `number` | The sRGB luminance of this color (`0`–`255`). Read only. |
| `isLight` | `boolean` | Whether this color is light (its luminance is above the dark/light threshold). Read only. |
| `isDark` | `boolean` | Whether this color is dark (its luminance is at or below the dark/light threshold). Read only. |

## Static methods

- [from](Color/from.md): Make a Color from an unknown value, or undefined if it can't be parsed.

## Methods

- [toString](Color/toString.md): Return this color as an rgba() string.

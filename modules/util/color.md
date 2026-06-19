# Color helpers

A `Color` class and accompanying helpers for parsing, representing, and converting CSS hex colours. Useful for theming, accessibility checks, and anywhere a component or tool needs to inspect or manipulate a colour value.

- Parses 3-digit (`#RGB`) and 6/8-digit (`#RRGGBB` / `#RRGGBBAA`) hex strings, with or without the `#` prefix.
- Channel values (`Color.r`, `Color.g`, `Color.b`, `Color.a`) are clamped to 0–255.
- `Color.isLight` / `Color.isDark` use the sRGB luminance formula (threshold: luminance > 140 = light).

## Usage

### Creating a Color

```ts
import { getColor, requireColor } from "shelving/util";

const c = getColor("#ff6600");   // Color instance
const c2 = getColor("F60");      // 3-digit shorthand, no '#'
getColor("not-a-color");         // undefined

requireColor("#ff6600");         // same but throws RequiredError on failure
```

### Converting and inspecting

```ts
import { getColor } from "shelving/util";

const c = getColor("#3399ff")!;
c.hex;        // "#3399ff"
c.rgb;        // "rgb(51, 153, 255)"
c.rgba;       // "rgba(51, 153, 255, 1)"
c.luminance;  // number
c.isLight;    // boolean
c.isDark;     // boolean
```

### Type guard and assertion

```ts
import { isColor, assertColor } from "shelving/util";

isColor(value);          // true if Color instance
assertColor(value);      // throws RequiredError if not
```

### Using the class directly

```ts
import { Color } from "shelving/util";

const white = new Color(255, 255, 255);
const transparent = new Color(0, 0, 0, 0);
Color.from("#abc");  // same as getColor
```

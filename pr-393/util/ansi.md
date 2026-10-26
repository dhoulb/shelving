# shelving/util/ansi

- Kind: module
- Import: `import { … } from "shelving/util/ansi";`

Constants and a helper for wrapping terminal output in ANSI escape codes. Use these when writing CLI tools or test reporters that need colour and style without pulling in a third-party library.

- All colour/style constants are plain escape-code strings, so you can concatenate them yourself or pass them to `ansiWrap()`.
- `ansiWrap` emits colour only when the runtime supports it, resolved once at module load the way the broader CLI ecosystem does — precedence `FORCE_COLOR` > `NO_COLOR` > TTY detection > default-off. Colour is emitted only when the output is an interactive TTY (or `FORCE_COLOR` opts in), so non-interactive sinks (files, log aggregators, serverless platforms like Cloudflare Workers) get plain text by default.
- `NO_COLOR` (any non-empty value) forces colour off, per [no-color.org](https://no-color.org); `FORCE_COLOR` forces it on (`0`/`false` forces off) and overrides `NO_COLOR`.

## Usage

### Wrapping text in colour or style

```ts
import { ansiWrap, ANSI_RED, ANSI_BOLD } from "shelving/util";

console.log(ansiWrap("Error!", ANSI_RED));
console.log(ansiWrap("Warning", ANSI_YELLOW, ANSI_BOLD)); // multiple wrappers
```

### Pre-coloured status icons

```ts
import { ANSI_SUCCESS, ANSI_FAILURE, ANSI_WAITING } from "shelving/util";

console.log(ANSI_SUCCESS); // ✓ in green
console.log(ANSI_FAILURE); // ✗ in red
console.log(ANSI_WAITING); // ⋯ in blue
```

Arrow icons (`ANSI_UP`, `ANSI_DOWN`, `ANSI_LEFT`, `ANSI_RIGHT`) are also available in blue.

Each icon is a plain string constant resolved once at module load via `ansiWrap()`, so colour is detected at import time — a TTY yields the coloured glyph, a non-interactive sink (file, log aggregator, Cloudflare Worker) yields the bare glyph.

### Using raw escape constants

```ts
import { ANSI_CYAN, ANSI_UNDERLINE, ANSI_RESET } from "shelving/util";

const styled = `${ANSI_CYAN}${ANSI_UNDERLINE}link text${ANSI_RESET}`;
```


## Functions

- [ansiWrap()](ansi/ansiWrap.md): Wrap a string in the ANSI color/style codes (at the start), and ANSI_RESET at the end.

## Constants

- [ANSI_DEFAULT](ansi/ANSI_DEFAULT.md): ANSI escape code that resets the foreground colour to the terminal default.
- [ANSI_BLACK](ansi/ANSI_BLACK.md): ANSI escape code that sets the foreground colour to black.
- [ANSI_RED](ansi/ANSI_RED.md): ANSI escape code that sets the foreground colour to red.
- [ANSI_GREEN](ansi/ANSI_GREEN.md): ANSI escape code that sets the foreground colour to green.
- [ANSI_YELLOW](ansi/ANSI_YELLOW.md): ANSI escape code that sets the foreground colour to yellow.
- [ANSI_BLUE](ansi/ANSI_BLUE.md): ANSI escape code that sets the foreground colour to blue.
- [ANSI_MAGENTA](ansi/ANSI_MAGENTA.md): ANSI escape code that sets the foreground colour to magenta.
- [ANSI_CYAN](ansi/ANSI_CYAN.md): ANSI escape code that sets the foreground colour to cyan.
- [ANSI_WHITE](ansi/ANSI_WHITE.md): ANSI escape code that sets the foreground colour to white.
- [ANSI_BOLD](ansi/ANSI_BOLD.md): ANSI escape code that enables bold text.
- [ANSI_ITALIC](ansi/ANSI_ITALIC.md): ANSI escape code that enables italic text.
- [ANSI_UNDERLINE](ansi/ANSI_UNDERLINE.md): ANSI escape code that enables underlined text.
- [ANSI_STRIKE](ansi/ANSI_STRIKE.md): ANSI escape code that enables strikethrough text.
- [ANSI_INVERSE](ansi/ANSI_INVERSE.md): ANSI escape code that enables inverse (swapped foreground/background) text.
- [ANSI_RESET](ansi/ANSI_RESET.md): ANSI escape code that resets all colour and style attributes.
- [ANSI_WAITING](ansi/ANSI_WAITING.md): Blue-coloured waiting icon (⋯) for use in template literals, resolved once at module load.
- [ANSI_SUCCESS](ansi/ANSI_SUCCESS.md): Green-coloured success icon (✓) for use in template literals, resolved once at module load.
- [ANSI_FAILURE](ansi/ANSI_FAILURE.md): Red-coloured failure icon (✗) for use in template literals, resolved once at module load.
- [ANSI_UP](ansi/ANSI_UP.md): Blue-coloured up arrow icon (↑) for use in template literals, resolved once at module load.
- [ANSI_DOWN](ansi/ANSI_DOWN.md): Blue-coloured down arrow icon (↓) for use in template literals, resolved once at module load.
- [ANSI_RIGHT](ansi/ANSI_RIGHT.md): Blue-coloured right arrow icon (→) for use in template literals, resolved once at module load.
- [ANSI_LEFT](ansi/ANSI_LEFT.md): Blue-coloured left arrow icon (←) for use in template literals, resolved once at module load.

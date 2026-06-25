# ANSI terminal colours

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

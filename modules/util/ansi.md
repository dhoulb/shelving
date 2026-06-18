# ANSI terminal colours

Constants and a helper for wrapping terminal output in ANSI escape codes. Use these when writing CLI tools or test reporters that need colour and style without pulling in a third-party library.

- All colour/style constants are plain escape-code strings, so you can concatenate them yourself or pass them to [`ansiWrap()`](/util/ansi/ansiWrap).
- `ansiWrap` is a no-op when the `NO_COLOR` environment variable is set, following the [no-color.org](https://no-color.org) convention.

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

### Using raw escape constants

```ts
import { ANSI_CYAN, ANSI_UNDERLINE, ANSI_RESET } from "shelving/util";

const styled = `${ANSI_CYAN}${ANSI_UNDERLINE}link text${ANSI_RESET}`;
```

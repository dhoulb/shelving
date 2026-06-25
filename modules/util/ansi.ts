import type { ImmutableArray } from "./array.js";
import { DOWN, FAILURE, LEFT, RIGHT, SUCCESS, UP, WAITING } from "./constants.js";
import { getEnv } from "./env.js";

// Colors.

/**
 * ANSI escape code that resets the foreground colour to the terminal default.
 *
 * @see https://shelving.cc/util/ansi/ANSI_DEFAULT
 */
export const ANSI_DEFAULT = "\x1b[39m" as const;

/**
 * ANSI escape code that sets the foreground colour to black.
 *
 * @see https://shelving.cc/util/ansi/ANSI_BLACK
 */
export const ANSI_BLACK = "\x1b[30m" as const;

/**
 * ANSI escape code that sets the foreground colour to red.
 *
 * @see https://shelving.cc/util/ansi/ANSI_RED
 */
export const ANSI_RED = "\x1b[31m" as const;

/**
 * ANSI escape code that sets the foreground colour to green.
 *
 * @see https://shelving.cc/util/ansi/ANSI_GREEN
 */
export const ANSI_GREEN = "\x1b[32m" as const;

/**
 * ANSI escape code that sets the foreground colour to yellow.
 *
 * @see https://shelving.cc/util/ansi/ANSI_YELLOW
 */
export const ANSI_YELLOW = "\x1b[33m" as const;

/**
 * ANSI escape code that sets the foreground colour to blue.
 *
 * @see https://shelving.cc/util/ansi/ANSI_BLUE
 */
export const ANSI_BLUE = "\x1b[34m" as const;

/**
 * ANSI escape code that sets the foreground colour to magenta.
 *
 * @see https://shelving.cc/util/ansi/ANSI_MAGENTA
 */
export const ANSI_MAGENTA = "\x1b[35m" as const;

/**
 * ANSI escape code that sets the foreground colour to cyan.
 *
 * @see https://shelving.cc/util/ansi/ANSI_CYAN
 */
export const ANSI_CYAN = "\x1b[36m" as const;

/**
 * ANSI escape code that sets the foreground colour to white.
 *
 * @see https://shelving.cc/util/ansi/ANSI_WHITE
 */
export const ANSI_WHITE = "\x1b[37m" as const;

// Styles.

/**
 * ANSI escape code that enables bold text.
 *
 * @see https://shelving.cc/util/ansi/ANSI_BOLD
 */
export const ANSI_BOLD = "\x1b[1m" as const;

/**
 * ANSI escape code that enables italic text.
 *
 * @see https://shelving.cc/util/ansi/ANSI_ITALIC
 */
export const ANSI_ITALIC = "\x1b[3m" as const;

/**
 * ANSI escape code that enables underlined text.
 *
 * @see https://shelving.cc/util/ansi/ANSI_UNDERLINE
 */
export const ANSI_UNDERLINE = "\x1b[4m" as const;

/**
 * ANSI escape code that enables strikethrough text.
 *
 * @see https://shelving.cc/util/ansi/ANSI_STRIKE
 */
export const ANSI_STRIKE = "\x1b[9m" as const;

/**
 * ANSI escape code that enables inverse (swapped foreground/background) text.
 *
 * @see https://shelving.cc/util/ansi/ANSI_INVERSE
 */
export const ANSI_INVERSE = "\x1b[7m" as const;

// Reset.

/**
 * ANSI escape code that resets all colour and style attributes.
 *
 * @see https://shelving.cc/util/ansi/ANSI_RESET
 */
export const ANSI_RESET = "\x1b[0m" as const;

/**
 * Whether ANSI colour should be emitted, resolved once at module load the way the broader CLI ecosystem does.
 *
 * Precedence, highest first (mirrors the `supports-color` resolution order):
 * 1. `FORCE_COLOR` — override on for any value except `0` / `false` (which forces off). An empty value counts as on.
 * 2. `NO_COLOR` — override off for any non-empty value, per [no-color.org](https://no-color.org).
 * 3. TTY detection — on only when `process.stdout` is an interactive TTY and `TERM` is not `dumb`.
 * 4. Otherwise off — non-interactive sinks (files, log aggregators, serverless platforms like Cloudflare Workers) get no escape codes by default.
 *
 * Resolved once at import rather than on every `ansiWrap()` call: TTY detection makes the load-time value correct in every sink, and the worst case (e.g. `process.env` populated after load) simply falls back to the no-colour default.
 */
const _USES_COLOR: boolean = (() => {
	// `FORCE_COLOR` overrides everything: "0"/"false" forces off, any other value (including empty) forces on.
	const force = getEnv("FORCE_COLOR");
	if (force !== undefined) return force !== "0" && force.toLowerCase() !== "false";
	// `NO_COLOR` with any non-empty value disables colour.
	if (getEnv("NO_COLOR")) return false;
	// Otherwise enable colour only for an interactive TTY that isn't a dumb terminal.
	return typeof process === "object" && !!process.stdout?.isTTY && getEnv("TERM") !== "dumb";
})();

/**
 * Wrap a string in the ANSI color/style codes (at the start), and `ANSI_RESET` at the end.
 *
 * - Colour is only emitted when the runtime supports it, resolved once at module load into `_USES_COLOR` — `FORCE_COLOR` > `NO_COLOR` > TTY detection > default-off.
 * - The default is *off* for non-interactive sinks (files, log aggregators, Workers), so escape codes never pollute non-TTY output unless `FORCE_COLOR` opts back in.
 *
 * @param input The string to wrap in ANSI codes.
 * @param wrappers Any number of ANSI escape codes (e.g. `ANSI_RED`, `ANSI_BOLD`) to prepend before `input`.
 * @returns The wrapped string, or `input` unchanged when colour is not supported (see precedence above).
 * @see https://shelving.cc/util/ansi/ansiWrap
 */
export function ansiWrap(input: string, ...wrappers: ImmutableArray<string>) {
	if (!_USES_COLOR) return input;
	return `${wrappers.join("")}${input}${ANSI_RESET}`;
}

// Coloured icons.
//
// Each icon is resolved once at module load by `ansiWrap()`, so colour support is detected at import time
// (a TTY yields a coloured icon; a non-interactive sink like a file or Cloudflare Worker yields the bare
// glyph). This trades the previous lazy re-evaluation — which honoured `process.env` mutated after load —
// for plain string constants, since TTY detection means the worst case simply falls back to the no-colour default.

/**
 * Blue-coloured waiting icon (`⋯`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_WAITING
 */
export const ANSI_WAITING = ansiWrap(WAITING, ANSI_BLUE);

/**
 * Green-coloured success icon (`✓`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_SUCCESS
 */
export const ANSI_SUCCESS = ansiWrap(SUCCESS, ANSI_GREEN);

/**
 * Red-coloured failure icon (`✗`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_FAILURE
 */
export const ANSI_FAILURE = ansiWrap(FAILURE, ANSI_RED);

/**
 * Blue-coloured up arrow icon (`↑`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_UP
 */
export const ANSI_UP = ansiWrap(UP, ANSI_BLUE);

/**
 * Blue-coloured down arrow icon (`↓`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_DOWN
 */
export const ANSI_DOWN = ansiWrap(DOWN, ANSI_BLUE);

/**
 * Blue-coloured right arrow icon (`→`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_RIGHT
 */
export const ANSI_RIGHT = ansiWrap(RIGHT, ANSI_BLUE);

/**
 * Blue-coloured left arrow icon (`←`) for use in template literals, resolved once at module load.
 *
 * @see https://shelving.cc/util/ansi/ANSI_LEFT
 */
export const ANSI_LEFT = ansiWrap(LEFT, ANSI_BLUE);

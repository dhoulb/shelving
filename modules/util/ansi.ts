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
export const ANSI_RESET = "\x1b[0m";

/**
 * Resolve whether ANSI colour should be emitted, the way the broader CLI ecosystem does.
 *
 * Precedence, highest first (mirrors the `supports-color` resolution order):
 * 1. `FORCE_COLOR` — override on for any value except `0` / `false` (which forces off). An empty value counts as on.
 * 2. `NO_COLOR` — override off for any non-empty value, per [no-color.org](https://no-color.org).
 * 3. TTY detection — on only when `process.stdout` is an interactive TTY and `TERM` is not `dumb`.
 * 4. Otherwise off — non-interactive sinks (files, log aggregators, serverless platforms like Cloudflare Workers) get no escape codes by default.
 *
 * Every input is read live on each call so runtimes that populate `process.env` late (e.g. Cloudflare Workers, where `[vars]` bindings are only reliably available within the request scope) are honoured rather than baking in module-load-time values.
 */
function _isColorSupported(): boolean {
	// `FORCE_COLOR` overrides everything: "0"/"false" forces off, any other value (including empty) forces on.
	const force = getEnv("FORCE_COLOR");
	if (force !== undefined) return force !== "0" && force.toLowerCase() !== "false";
	// `NO_COLOR` with any non-empty value disables colour.
	if (getEnv("NO_COLOR")) return false;
	// Otherwise enable colour only for an interactive TTY that isn't a dumb terminal.
	return typeof process === "object" && !!process.stdout?.isTTY && getEnv("TERM") !== "dumb";
}

/**
 * Wrap a string in the ANSI color/style codes (at the start), and `ANSI_RESET` at the end.
 *
 * - Colour is only emitted when the runtime supports it, resolved live on every call by `_isColorSupported()` — `FORCE_COLOR` > `NO_COLOR` > TTY detection > default-off. Reading live means runtimes that populate `process.env` late (e.g. Cloudflare Workers, where `[vars]` bindings are only reliably available within the request scope) are honoured rather than baking in module-load-time values.
 * - The default is *off* for non-interactive sinks (files, log aggregators, Workers), so escape codes never pollute non-TTY output unless `FORCE_COLOR` opts back in.
 *
 * @param input The string to wrap in ANSI codes.
 * @param wrappers Any number of ANSI escape codes (e.g. `ANSI_RED`, `ANSI_BOLD`) to prepend before `input`.
 * @returns The wrapped string, or `input` unchanged when colour is not supported (see precedence above).
 * @example ansiWrap("hello", ANSI_RED, ANSI_BOLD) // "\x1b[31m\x1b[1mhello\x1b[0m"
 * @see https://shelving.cc/util/ansi/ansiWrap
 */
export function ansiWrap(input: string, ...wrappers: ImmutableArray<string>) {
	if (!_isColorSupported()) return input;
	return `${wrappers.join("")}${input}${ANSI_RESET}`;
}

/**
 * A lazily-coloured icon that re-evaluates its ANSI colouring against the live colour-support resolution (`FORCE_COLOR` > `NO_COLOR` > TTY detection) every time it is converted to a string.
 *
 * - Used directly inside template literals (`${ANSI_SUCCESS}`), where JavaScript invokes `toString()` automatically, so the icon is coloured at use-time, not at module-load time.
 *
 * @see https://shelving.cc/util/ansi/AnsiIcon
 */
export type AnsiIcon = { toString(): string };

/** Create a lazily-coloured {@link AnsiIcon} that wraps `icon` in `wrappers` on each `toString()`. */
function _createAnsiIcon(icon: string, ...wrappers: ImmutableArray<string>): AnsiIcon {
	return {
		toString() {
			return ansiWrap(icon, ...wrappers);
		},
	};
}

// Coloured icons.

/**
 * Lazily blue-coloured waiting icon (`⋯`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_WAITING
 */
export const ANSI_WAITING = _createAnsiIcon(WAITING, ANSI_BLUE);

/**
 * Lazily green-coloured success icon (`✓`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_SUCCESS
 */
export const ANSI_SUCCESS = _createAnsiIcon(SUCCESS, ANSI_GREEN);

/**
 * Lazily red-coloured failure icon (`✗`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_FAILURE
 */
export const ANSI_FAILURE = _createAnsiIcon(FAILURE, ANSI_RED);

/**
 * Lazily blue-coloured up arrow icon (`↑`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_UP
 */
export const ANSI_UP = _createAnsiIcon(UP, ANSI_BLUE);

/**
 * Lazily blue-coloured down arrow icon (`↓`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_DOWN
 */
export const ANSI_DOWN = _createAnsiIcon(DOWN, ANSI_BLUE);

/**
 * Lazily blue-coloured right arrow icon (`→`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_RIGHT
 */
export const ANSI_RIGHT = _createAnsiIcon(RIGHT, ANSI_BLUE);

/**
 * Lazily blue-coloured left arrow icon (`←`) for use in template literals.
 *
 * @see https://shelving.cc/util/ansi/ANSI_LEFT
 */
export const ANSI_LEFT = _createAnsiIcon(LEFT, ANSI_BLUE);

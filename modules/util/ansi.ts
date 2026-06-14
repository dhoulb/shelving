import type { ImmutableArray } from "./array.js";
import { DOWN, FAILURE, LEFT, RIGHT, SUCCESS, UP, WAITING } from "./constants.js";
import { getEnvBoolean } from "./env.js";

// Colors.

/**
 * ANSI escape code that resets the foreground colour to the terminal default.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_DEFAULT
 */
export const ANSI_DEFAULT = "\x1b[39m" as const;

/**
 * ANSI escape code that sets the foreground colour to black.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_BLACK
 */
export const ANSI_BLACK = "\x1b[30m" as const;

/**
 * ANSI escape code that sets the foreground colour to red.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_RED
 */
export const ANSI_RED = "\x1b[31m" as const;

/**
 * ANSI escape code that sets the foreground colour to green.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_GREEN
 */
export const ANSI_GREEN = "\x1b[32m" as const;

/**
 * ANSI escape code that sets the foreground colour to yellow.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_YELLOW
 */
export const ANSI_YELLOW = "\x1b[33m" as const;

/**
 * ANSI escape code that sets the foreground colour to blue.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_BLUE
 */
export const ANSI_BLUE = "\x1b[34m" as const;

/**
 * ANSI escape code that sets the foreground colour to magenta.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_MAGENTA
 */
export const ANSI_MAGENTA = "\x1b[35m" as const;

/**
 * ANSI escape code that sets the foreground colour to cyan.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_CYAN
 */
export const ANSI_CYAN = "\x1b[36m" as const;

/**
 * ANSI escape code that sets the foreground colour to white.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_WHITE
 */
export const ANSI_WHITE = "\x1b[37m" as const;

// Styles.

/**
 * ANSI escape code that enables bold text.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_BOLD
 */
export const ANSI_BOLD = "\x1b[1m" as const;

/**
 * ANSI escape code that enables italic text.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_ITALIC
 */
export const ANSI_ITALIC = "\x1b[3m" as const;

/**
 * ANSI escape code that enables underlined text.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_UNDERLINE
 */
export const ANSI_UNDERLINE = "\x1b[4m" as const;

/**
 * ANSI escape code that enables strikethrough text.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_STRIKE
 */
export const ANSI_STRIKE = "\x1b[9m" as const;

/**
 * ANSI escape code that enables inverse (swapped foreground/background) text.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_INVERSE
 */
export const ANSI_INVERSE = "\x1b[7m" as const;

// Reset.

/**
 * ANSI escape code that resets all colour and style attributes.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_RESET
 */
export const ANSI_RESET = "\x1b[0m";

/**
 * Wrap a string in the ANSI color/style codes (at the start), and `ANSI_RESET` at the end.
 *
 * - The `NO_COLOR` environment variable is read live on every call, so runtimes that populate `process.env` late (e.g. Cloudflare Workers, where `[vars]` bindings are only reliably available within the request scope) are honoured rather than baking in whatever `NO_COLOR` was at module-load time.
 *
 * @param input The string to wrap in ANSI codes.
 * @param wrappers Any number of ANSI escape codes (e.g. `ANSI_RED`, `ANSI_BOLD`) to prepend before `input`.
 * @returns The wrapped string, or `input` unchanged when the `NO_COLOR` environment variable is set.
 * @example ansiWrap("hello", ANSI_RED, ANSI_BOLD) // "\x1b[31m\x1b[1mhello\x1b[0m"
 * @see https://dhoulb.github.io/shelving/util/ansi/ansiWrap
 */
export function ansiWrap(input: string, ...wrappers: ImmutableArray<string>) {
	if (getEnvBoolean("NO_COLOR")) return input;
	return `${wrappers.join("")}${input}${ANSI_RESET}`;
}

/**
 * A lazily-coloured icon that re-evaluates its ANSI colouring against the live `NO_COLOR` environment variable every time it is converted to a string.
 *
 * - Used directly inside template literals (`${ANSI_SUCCESS}`), where JavaScript invokes `toString()` automatically, so the icon is coloured at use-time, not at module-load time.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/AnsiIcon
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
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_WAITING
 */
export const ANSI_WAITING = _createAnsiIcon(WAITING, ANSI_BLUE);

/**
 * Lazily green-coloured success icon (`✓`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_SUCCESS
 */
export const ANSI_SUCCESS = _createAnsiIcon(SUCCESS, ANSI_GREEN);

/**
 * Lazily red-coloured failure icon (`✗`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_FAILURE
 */
export const ANSI_FAILURE = _createAnsiIcon(FAILURE, ANSI_RED);

/**
 * Lazily blue-coloured up arrow icon (`↑`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_UP
 */
export const ANSI_UP = _createAnsiIcon(UP, ANSI_BLUE);

/**
 * Lazily blue-coloured down arrow icon (`↓`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_DOWN
 */
export const ANSI_DOWN = _createAnsiIcon(DOWN, ANSI_BLUE);

/**
 * Lazily blue-coloured right arrow icon (`→`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_RIGHT
 */
export const ANSI_RIGHT = _createAnsiIcon(RIGHT, ANSI_BLUE);

/**
 * Lazily blue-coloured left arrow icon (`←`) for use in template literals.
 *
 * @see https://dhoulb.github.io/shelving/util/ansi/ANSI_LEFT
 */
export const ANSI_LEFT = _createAnsiIcon(LEFT, ANSI_BLUE);

import type { ImmutableArray } from "./array.js";
import { DOWN, FAILURE, LEFT, RIGHT, SUCCESS, UP, WAITING } from "./constants.js";
import { getEnvBoolean } from "./env.js";

// Colors.
export const ANSI_DEFAULT = "\x1b[39m" as const;
export const ANSI_BLACK = "\x1b[30m" as const;
export const ANSI_RED = "\x1b[31m" as const;
export const ANSI_GREEN = "\x1b[32m" as const;
export const ANSI_YELLOW = "\x1b[33m" as const;
export const ANSI_BLUE = "\x1b[34m" as const;
export const ANSI_MAGENTA = "\x1b[35m" as const;
export const ANSI_CYAN = "\x1b[36m" as const;
export const ANSI_WHITE = "\x1b[37m" as const;

// Styles.
export const ANSI_BOLD = "\x1b[1m" as const;
export const ANSI_ITALIC = "\x1b[3m" as const;
export const ANSI_UNDERLINE = "\x1b[4m" as const;
export const ANSI_STRIKE = "\x1b[9m" as const;
export const ANSI_INVERSE = "\x1b[7m" as const;

// Reset.
export const ANSI_RESET = "\x1b[0m";

/**
 * Wrap a string in the ANSI color/style codes (at the start), and `ANSI_RESET` at the end.
 *
 * - The `NO_COLOR` environment variable is read live on every call, so runtimes that populate `process.env` late (e.g. Cloudflare Workers, where `[vars]` bindings are only reliably available within the request scope) are honoured rather than baking in whatever `NO_COLOR` was at module-load time.
 */
export function ansiWrap(input: string, ...wrappers: ImmutableArray<string>) {
	if (getEnvBoolean("NO_COLOR")) return input;
	return `${wrappers.join("")}${input}${ANSI_RESET}`;
}

/**
 * A lazily-coloured icon that re-evaluates its ANSI colouring against the live `NO_COLOR` environment variable every time it is converted to a string.
 *
 * - Used directly inside template literals (`${ANSI_SUCCESS}`), where JavaScript invokes `toString()` automatically, so the icon is coloured at use-time, not at module-load time.
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
export const ANSI_WAITING = _createAnsiIcon(WAITING, ANSI_BLUE);
export const ANSI_SUCCESS = _createAnsiIcon(SUCCESS, ANSI_GREEN);
export const ANSI_FAILURE = _createAnsiIcon(FAILURE, ANSI_RED);
export const ANSI_UP = _createAnsiIcon(UP, ANSI_BLUE);
export const ANSI_DOWN = _createAnsiIcon(DOWN, ANSI_BLUE);
export const ANSI_RIGHT = _createAnsiIcon(RIGHT, ANSI_BLUE);
export const ANSI_LEFT = _createAnsiIcon(LEFT, ANSI_BLUE);

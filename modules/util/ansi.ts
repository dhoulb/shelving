import type { ImmutableArray } from "./array.js";
import { DOWN, FAILURE, LEFT, RIGHT, SUCCESS, UP, WAITING } from "./constants.js";
import { NO_COLOR } from "./env.js";

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

/** Wrap a string in `ANSI_RED` or the ANSI color/style codes (at the start), and `ANSI_RESET` at the end. */
export function ansiWrap(input: string, ...wrappers: ImmutableArray<string>) {
	if (NO_COLOR) return input;
	return `${wrappers.join("")}${input}${ANSI_RESET}`;
}

// Coloured icons.
export const ANSI_WAITING = ansiWrap(WAITING, ANSI_BLUE);
export const ANSI_SUCCESS = ansiWrap(SUCCESS, ANSI_GREEN);
export const ANSI_FAILURE = ansiWrap(FAILURE, ANSI_RED);
export const ANSI_UP = ansiWrap(UP, ANSI_BLUE);
export const ANSI_DOWN = ansiWrap(DOWN, ANSI_BLUE);
export const ANSI_RIGHT = ansiWrap(RIGHT, ANSI_BLUE);
export const ANSI_LEFT = ansiWrap(LEFT, ANSI_BLUE);

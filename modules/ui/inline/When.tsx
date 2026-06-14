import type { ReactElement } from "react";
import { type PossibleDate, requireDate } from "../../util/date.js";
import { formatAgo, formatUntil, formatWhen, getSecondsAgo } from "../../util/duration.js";
import { formatDateTime } from "../../util/format.js";
import type { AnyCaller } from "../../util/function.js";
import type { OptionalChildProps } from "../util/props.js";

const _OPTIONS: Intl.NumberFormatOptions = { unitDisplay: "narrow" };

function _getWhen(
	formatter: typeof formatWhen,
	{ target: possibleTarget, current: possibleCurrent = "now", full = false, children }: WhenProps,
	caller: AnyCaller,
): ReactElement {
	const target = requireDate(possibleTarget, caller);
	const current = requireDate(possibleCurrent, caller);
	const title = possibleCurrent === "now" ? formatDateTime(target) : `${formatDateTime(target)} to ${formatDateTime(current)}`;
	const formatted = children ?? (full ? `${title} (${formatter(target, current, _OPTIONS)})` : formatter(target, current, _OPTIONS));
	return (
		<time dateTime={possibleCurrent === "now" ? target.toISOString() : `PT${getSecondsAgo(target, current)}S`} title={title}>
			{formatted}
		</time>
	);
}

/**
 * Props for `When`, `Ago`, and `Until` — a `target` date plus an optional `current` reference date and `full` toggle.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/When/WhenProps
 */
export interface WhenProps extends OptionalChildProps {
	target: PossibleDate | undefined;
	current?: PossibleDate | undefined;
	full?: boolean | undefined;
}

/**
 * Relative time — shows a signed string like `in 6d` or `3w ago` wrapped in a `<time>` element carrying the machine-readable date.
 *
 * @param props The `target` date, optional `current` reference (defaults to now), `full` toggle, and `children` override.
 * @returns Rendered `<time>` element showing the relative time.
 * @throws {RequiredError} If `target` (or `current`) cannot be coerced to a valid date.
 * @example <When target="2030-01-01" />
 * @see https://dhoulb.github.io/shelving/ui/inline/When/When
 */
export function When(props: WhenProps): ReactElement {
	return _getWhen(formatWhen, props, When);
}

/**
 * Props for `Ago` — identical to `WhenProps`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/When/AgoProps
 */
export interface AgoProps extends WhenProps {}

/**
 * Elapsed time — shows an unsigned string like `6d` or `3w` for a past date wrapped in a `<time>` element carrying the machine-readable date.
 *
 * @param props The `target` date, optional `current` reference (defaults to now), `full` toggle, and `children` override.
 * @returns Rendered `<time>` element showing the elapsed time.
 * @throws {RequiredError} If `target` (or `current`) cannot be coerced to a valid date.
 * @example <Ago target="2020-01-01" />
 * @see https://dhoulb.github.io/shelving/ui/inline/When/Ago
 */
export function Ago(props: AgoProps): ReactElement {
	return _getWhen(formatAgo, props, Ago);
}

/**
 * Props for `Until` — identical to `WhenProps`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/When/UntilProps
 */
export interface UntilProps extends WhenProps {}

/**
 * Remaining time — shows an unsigned string like `6d` or `3w` for a future date wrapped in a `<time>` element carrying the machine-readable date.
 *
 * @param props The `target` date, optional `current` reference (defaults to now), `full` toggle, and `children` override.
 * @returns Rendered `<time>` element showing the remaining time.
 * @throws {RequiredError} If `target` (or `current`) cannot be coerced to a valid date.
 * @example <Until target="2030-01-01" />
 * @see https://dhoulb.github.io/shelving/ui/inline/When/Until
 */
export function Until(props: UntilProps): ReactElement {
	return _getWhen(formatUntil, props, Until);
}

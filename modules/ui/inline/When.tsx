import type { ReactElement, ReactNode } from "react";
import {
	type AnyCaller,
	formatAgo,
	formatDateTime,
	formatUntil,
	formatWhen,
	getSecondsAgo,
	type PossibleDate,
	requireDate,
} from "shelving";

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

export interface WhenProps {
	target: PossibleDate | undefined;
	current?: PossibleDate | undefined;
	children?: ReactNode | undefined;
	full?: boolean | undefined;
}

/** Show a string like `in 6d` or `3w ago` wrapped with a `<time>` element providing the machine-readable format of the same date. */
export function When(props: WhenProps): ReactElement {
	return _getWhen(formatWhen, props, When);
}

export interface AgoProps extends WhenProps {}

/** Show a string like `6d` or `3w` wrapped with a `<time>` element providing the machine-readable format of the same date. */
export function Ago(props: AgoProps): ReactElement {
	return _getWhen(formatAgo, props, Ago);
}

export interface UntilProps extends WhenProps {}

/** Show a string like `6d` or `3w` wrapped with a `<time>` element providing the machine-readable format of the same date. */
export function Until(props: UntilProps): ReactElement {
	return _getWhen(formatUntil, props, Until);
}

import type { ReactElement } from "react";
import { Block } from "../block/Block.js";
import { LOADING } from "../misc/Loading.js";
import type { ChildProps, ClassProps } from "../util/props.js";

/**
 * Props for `<Empty>` — the message content plus an optional `className`.
 *
 * @see https://shelving.cc/ui/EmptyProps
 */
export interface EmptyProps extends ChildProps, ClassProps {}

/**
 * Message for a list with nothing in it: centred, grey content with space around it.
 * - Use it for every empty list, so they all look the same.
 * - Pass the text as `<Paragraph>` elements, plus any buttons. Each child keeps its own margins.
 *
 * @kind component
 * @see https://shelving.cc/ui/Empty
 */
export function Empty({ children, className }: EmptyProps): ReactElement {
	return (
		<Block center tint="50" space="xlarge" className={className}>
			{children}
		</Block>
	);
}

/**
 * Loading spinner in an `<Empty>`, for a list or form that is still loading. The empty message replaces it in the same place.
 *
 * @see https://shelving.cc/ui/EMPTY_LOADING
 */
export const EMPTY_LOADING = <Empty key="loading">{LOADING}</Empty>;

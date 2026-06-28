import { ChevronUpIcon } from "@heroicons/react/24/outline";
import type { ReactElement, ReactNode } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass } from "../util/css.js";
import DETAILS_CSS from "./Details.module.css";

const DETAILS_CLASS = DETAILS_CSS.details;
const DETAILS_SUMMARY_CLASS = DETAILS_CSS.summary;

/** Props for `DetailsItem` — a single collapsible disclosure. */
export interface DetailsProps extends BlockVariants {
	/** Content of the always-visible summary (e.g. a question). */
	title: ReactNode;
	/** Whether the item starts expanded. */
	open?: boolean | undefined;
	/** Shared group name — items with the same `name` open exclusively (only one at a time). */
	name?: string | undefined;
	/** Content revealed when the item is expanded. */
	children: ReactNode;
}

/**
 * A single collapsible panel within an `Details`, built on native `<details>` and `<summary>`
 * - Panel animates to its true height (where `interpolate-size` + `::details-content` are supported),
 * - Give sibling items a shared `name` to make them open exclusively.
 *
 * @kind component
 */
export function Details({ title, open = false, name, children, ...props }: DetailsProps): ReactElement {
	return (
		<details className={getClass(DETAILS_CLASS, getBlockClass(props))} open={open} name={name}>
			<summary className={DETAILS_SUMMARY_CLASS}>
				<span>{title}</span>
				<ChevronUpIcon />
			</summary>
			{children}
		</details>
	);
}

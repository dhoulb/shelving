import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DELETED_CSS from "./Deleted.module.css";

const DELETED_CLASS = getModuleClass(DELETED_CSS, "deleted");

/**
 * Props for `Deleted` — colour and typography variants, plus optional `children`.
 *
 * @see https://shelving.cc/ui/DeletedProps
 */
export interface DeletedProps extends OptionalChildProps, TypographyVariants {}

/**
 * Deleted text — renders a `<del>` element to mark content removed from a document.
 *
 * @kind component
 * @example <Deleted>old price</Deleted>
 * @see https://shelving.cc/ui/Deleted
 */
export function Deleted({ children, ...props }: DeletedProps): ReactElement {
	return (
		<del
			className={getClass(
				DELETED_CLASS, //
				getTypographyClass(props),
			)}
		>
			{children}
		</del>
	);
}

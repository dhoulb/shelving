import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import INSERTED_CSS from "./Inserted.module.css";

const INSERTED_CLASS = getModuleClass(INSERTED_CSS, "inserted");

/**
 * Props for `Inserted` — colour and typography variants, plus optional `children`.
 *
 * @see https://shelving.cc/ui/InsertedProps
 */
export interface InsertedProps extends OptionalChildProps, ColorVariants, TypographyVariants {}

/**
 * Inserted text — renders an `<ins>` element to mark content added to a document.
 *
 * @kind component
 * @example <Inserted>new price</Inserted>
 * @see https://shelving.cc/ui/Inserted
 */
export function Inserted({ children, ...props }: InsertedProps): ReactElement {
	return (
		<ins
			className={getClass(
				INSERTED_CLASS, //
				getColorClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</ins>
	);
}

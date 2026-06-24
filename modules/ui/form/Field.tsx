import type { ReactElement, ReactNode } from "react";
import { Message } from "../notice/Message.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import FIELD_CSS from "./Field.module.css";

const FIELD_CLASS = getModuleClass(FIELD_CSS, "field");
const FIELD_TITLE_CLASS = getModuleClass(FIELD_CSS, "title");
const FIELD_DESCRIPTION_CLASS = getModuleClass(FIELD_CSS, "description");

/**
 * Props for `Field`, a labelled wrapper around a form control.
 *
 * @see https://shelving.cc/ui/FieldProps
 */
export interface FieldProps extends BlockVariants, ChildProps {
	title?: ReactNode | undefined;
	description?: ReactNode | undefined;
	message?: ReactNode | undefined;
	required?: boolean | undefined;
}

/**
 * A `<Field>` wraps around a form control/input, to shows a small `<label>` above it.
 *
 * @kind component
 * @see https://shelving.cc/ui/Field
 */
export function Field({ title, description, message, children, ...props }: FieldProps): ReactElement {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Generally `children` will contain a field.
		<label
			className={getClass(
				FIELD_CLASS, //
				getBlockClass(props),
			)}
		>
			{(title || description) && (
				<div>
					{title ? <div className={FIELD_TITLE_CLASS}>{title}</div> : null}
					{description && <div className={FIELD_DESCRIPTION_CLASS}>{description}</div>}
				</div>
			)}
			{children}
			{message && (
				<Message status="error" right>
					{message}
				</Message>
			)}
		</label>
	);
}

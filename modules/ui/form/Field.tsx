import type { ReactElement, ReactNode } from "react";
import { Message } from "../notice/Message.js";
import { getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Field.module.css";

const FIELD_CLASS = getModuleClass(styles, "filed");
const FIELD_TITLE_CLASS = getModuleClass(styles, "title");
const FIELD_DESCRIPTION_CLASS = getModuleClass(styles, "description");

/**
 * Props for `Field`, a labelled wrapper around a form control.
 *
 * @see https://shelving.cc/ui/FieldProps
 */
export interface FieldProps extends ChildProps {
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
export function Field({ title, description, message, children }: FieldProps): ReactElement {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Generally `children` will contain a field.
		<label className={FIELD_CLASS}>
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

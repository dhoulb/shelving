import type { ReactElement, ReactNode } from "react";
import { Message } from "../notice/Message.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Field.module.css";

/**
 * Props for `Field`, a labelled wrapper around a form control.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Field/FieldProps
 */
export interface FieldProps extends ChildProps {
	title?: ReactNode | undefined;
	description?: ReactNode | undefined;
	message?: ReactNode | undefined;
	required?: boolean | undefined;
	/** Render at half width (50%) so two fields sit side-by-side; defaults to full width (one per row). */
	half?: boolean | undefined;
}

/**
 * A `<Field>` wraps around a form control/input, to shows a small `<label>` above it.
 *
 * @kind component
 * @see https://dhoulb.github.io/shelving/ui/form/Field/Field
 */
export function Field({ title, description, message, half, children }: FieldProps): ReactElement {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Generally `children` will contain a field.
		<label className={getClass(getModuleClass(styles, "field"), half && getModuleClass(styles, "half"))}>
			{(title || description) && (
				<div>
					{title ? <div className={getModuleClass(styles, "title")}>{title}</div> : null}
					{description && <div className={getModuleClass(styles, "description")}>{description}</div>}
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

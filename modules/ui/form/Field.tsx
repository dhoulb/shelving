import type { ReactElement, ReactNode } from "react";
import { Message } from "../notice/Message.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Field.module.css";

export interface FieldProps extends ChildProps {
	title?: ReactNode | undefined;
	description?: ReactNode | undefined;
	message?: ReactNode | undefined;
	required?: boolean | undefined;
}

/** A `<Field>` wraps around a form control/input, to shows a small `<label>` above it. */
export function Field({ title, description, message, children }: FieldProps): ReactElement {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Generally `children` will contain a field.
		<label className={styles.field}>
			{(title || description) && (
				<div>
					{title ? <div className={styles.title}>{title}</div> : null}
					{description && <div className={styles.description}>{description}</div>}
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

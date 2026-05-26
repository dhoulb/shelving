import type { ReactElement } from "react";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Code.module.css";

const CODE_CLASS = getClass(styles.code);

export interface CodeProps extends OptionalChildProps {}

export function Code({ children }: CodeProps): ReactElement {
	return <code className={CODE_CLASS}>{children}</code>;
}

export interface KeyboardProps extends OptionalChildProps {}

export function Keyboard({ children }: KeyboardProps): ReactElement {
	return <kbd className={CODE_CLASS}>{children}</kbd>;
}

export interface SampleProps extends OptionalChildProps {}

export function Sample({ children }: SampleProps): ReactElement {
	return <samp className={CODE_CLASS}>{children}</samp>;
}

export interface VariableProps extends OptionalChildProps {}

export function Variable({ children }: VariableProps): ReactElement {
	return <var className={CODE_CLASS}>{children}</var>;
}

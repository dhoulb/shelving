import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Code.module.css";

export interface CodeProps extends OptionalChildProps {}

export function Code({ children }: CodeProps): ReactElement {
	return <code className={styles.code}>{children}</code>;
}

export interface KeyboardProps extends OptionalChildProps {}

export function Keyboard({ children }: KeyboardProps): ReactElement {
	return <kbd className={styles.code}>{children}</kbd>;
}

export interface SampleProps extends OptionalChildProps {}

export function Sample({ children }: SampleProps): ReactElement {
	return <samp className={styles.code}>{children}</samp>;
}

export interface VariableProps extends OptionalChildProps {}

export function Variable({ children }: VariableProps): ReactElement {
	return <var className={styles.code}>{children}</var>;
}

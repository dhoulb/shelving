import type { ReactElement, ReactNode } from "react";
import styles from "./Code.module.css";

export interface CodeProps {
	children?: ReactNode;
}

export function Code({ children }: CodeProps): ReactElement {
	return <code className={styles.code}>{children}</code>;
}

export interface KeyboardProps {
	children?: ReactNode;
}

export function Keyboard({ children }: KeyboardProps): ReactElement {
	return <kbd className={styles.code}>{children}</kbd>;
}

export interface SampleProps {
	children?: ReactNode;
}

export function Sample({ children }: SampleProps): ReactElement {
	return <samp className={styles.code}>{children}</samp>;
}

export interface VariableProps {
	children?: ReactNode;
}

export function Variable({ children }: VariableProps): ReactElement {
	return <var className={styles.code}>{children}</var>;
}

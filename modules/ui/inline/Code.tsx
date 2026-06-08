import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CODE_CSS from "./Code.module.css";

export const CODE_CLASS = getModuleClass(CODE_CSS, "code");
export const CODE_PROSE_CLASS = getModuleClass(CODE_CSS, "prose");

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

import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Divider.module.css";

export interface DividerProps extends SpacingVariants, ThicknessVariants {}

export function Divider(props: DividerProps) {
	return <hr className={getClass(getModuleClass(styles, "divider"), getSpacingClass(props), getThicknessClass(props))} />;
}

import styles from "./Divider.module.css";

declare const _componentProps: unique symbol;

export interface DividerProps {
	readonly [_componentProps]?: never;
}

export function Divider() {
	return <hr className={styles.divider} />;
}

import type { ReactElement } from "react";
import styles from "./Loading.module.css";

declare const _componentProps: unique symbol;

export interface LoadingProps {
	readonly [_componentProps]?: never;
}

export function Loading(): ReactElement {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={styles.spinner} data-slot="icon">
			<title>Loading...</title>
			<circle className={styles.track} cx="12" cy="12" r="9" pathLength="100" />
			<g>
				<animateTransform
					attributeName="transform"
					attributeType="xml"
					type="rotate"
					from="0 12 12"
					to="360 12 12"
					dur="0.5s"
					repeatCount="indefinite"
				/>
				<circle className={styles.indicator} cx="12" cy="12" r="9" pathLength="100" />
			</g>
		</svg>
	);
}

export const LOADING = <Loading key="loading" />;

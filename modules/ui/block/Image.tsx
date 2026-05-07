import type { ReactElement } from "react";
import styles from "./Image.module.css";

export interface ImageProps {
	src: string;
	alt?: string;
}

export function Image({ src, alt }: ImageProps): ReactElement {
	return <img src={src} className={styles.image} alt={alt} />;
}

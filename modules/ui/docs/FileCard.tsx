import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";

/** Card renderer for a `tree-file` element. */
export function FileCard({ title, name, description }: FileElementProps): ReactNode {
	return (
		<div>
			<h3>{title ?? name}</h3>
			{description && <p>{description}</p>}
		</div>
	);
}

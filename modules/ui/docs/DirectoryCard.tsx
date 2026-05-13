import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";

/** Card renderer for a `tree-directory` element. */
export function DirectoryCard({ title, name, description }: DirectoryElementProps): ReactNode {
	return (
		<div>
			<h3>{title ?? name}</h3>
			{description && <p>{description}</p>}
		</div>
	);
}

import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { Preformatted } from "../block/Preformatted.js";

/** Props for `DocumentationSignatures`. */
export interface DocumentationSignaturesProps {
	/** Type signatures to render — one block per overload. */
	readonly signatures?: ImmutableArray<string> | undefined;
}

/**
 * Render a documented symbol's signature(s) as monospace code blocks — one `<Preformatted>` per overload.
 * - Shared by `DocumentationCard` and `DocumentationPage` so signatures render identically in both (calm code
 *   blocks, not a shouty heading).
 * - Renders nothing when there are no signatures.
 */
export function DocumentationSignatures({ signatures }: DocumentationSignaturesProps): ReactNode {
	if (!signatures?.length) return null;
	return signatures.map(signature => (
		<Preformatted key={signature} wrap>
			{signature}
		</Preformatted>
	));
}

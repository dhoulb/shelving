import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { Preformatted } from "../block/Preformatted.js";

/**
 * Props for `DocumentationSignatures` — the type signatures to render, one block per overload.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationSignatures/DocumentationSignaturesProps
 */
export interface DocumentationSignaturesProps {
	/** Type signatures to render — one block per overload. */
	readonly signatures?: ImmutableArray<string> | undefined;
}

/**
 * Render a documented symbol's signature(s) as monospace code blocks — one `<Preformatted>` per overload.
 * - Shared by [`DocumentationCard`](/ui/DocumentationCard) and [`DocumentationPage`](/ui/DocumentationPage) so signatures render identically in both (calm code
 *   blocks, not a shouty heading).
 * - Renders nothing when there are no signatures.
 *
 * @returns One [`<Preformatted>`](/ui/Preformatted) block per signature, or `null` when there are none.
 * @example <DocumentationSignatures signatures={["getArray<T>(arr: T[]): T"]} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationSignatures/DocumentationSignatures
 */
export function DocumentationSignatures({ signatures }: DocumentationSignaturesProps): ReactNode {
	if (!signatures?.length) return null;
	return signatures.map(signature => (
		<Preformatted key={signature} wrap>
			{signature}
		</Preformatted>
	));
}

import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import { IndexExtractor } from "../modules/extract/IndexExtractor.js";
import { MergingExtractor } from "../modules/extract/MergingExtractor.js";
import { PackageExtractor } from "../modules/extract/PackageExtractor.js";
import { walkElements } from "../modules/util/element.js";
import type { AbsolutePath } from "../modules/util/path.js";
import type { TreeElement } from "../modules/util/tree.js";
import { GUIDES_DIR } from "./env.js";

/**
 * Extract the docs tree for the package.
 * - Walk the source directory, merge `.md` siblings into their `.ts` counterparts, and absorb each directory's `README.md` into the directory element itself.
 * - Read `package.json` and produce the module tree — one `kind: "module"` entry per export.
 * - Add the `guides/` directory as the first child, so the guides come before the modules (at `/guides/<name>`).
 */
export async function extractTree(sourceDir: AbsolutePath, packageJson: AbsolutePath): Promise<TreeElement> {
	const extractor = new IndexExtractor(new MergingExtractor(new DirectoryExtractor()));
	const tree = await extractor.extract(sourceDir);
	const root = await new PackageExtractor({ tree }).extract(packageJson);
	const guides = await extractor.extract(GUIDES_DIR);
	return { ...root, props: { ...root.props, children: [guides, ...walkElements(root.props.children)] } };
}

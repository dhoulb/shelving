import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import { IndexExtractor } from "../modules/extract/IndexExtractor.js";
import { MergingExtractor } from "../modules/extract/MergingExtractor.js";
import { PackageExtractor } from "../modules/extract/PackageExtractor.js";
import type { AbsolutePath } from "../modules/util/path.js";
import type { TreeElement } from "../modules/util/tree.js";

/**
 * Extract the docs tree for the package.
 * - Walk the source directory, merge `.md` siblings into their `.ts` counterparts, and absorb each directory's `README.md` into the directory element itself.
 * - Read `package.json` and produce the module tree — one `kind: "module"` entry per export.
 */
export async function extractTree(sourceDir: AbsolutePath, packageJson: AbsolutePath): Promise<TreeElement> {
	const tree = await new IndexExtractor(new MergingExtractor(new DirectoryExtractor())).extract(sourceDir);
	return new PackageExtractor({ tree }).extract(packageJson);
}

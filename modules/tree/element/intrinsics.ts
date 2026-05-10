import type { ClassCodeElementProps, CodeElementProps } from "./CodeElement.js";
import type { DirectoryElementProps, FileElementProps } from "./PathElement.js";

declare module "react" {
	// biome-ignore lint/style/noNamespace: Required for JSX IntrinsicElements augmentation.
	namespace JSX {
		interface IntrinsicElements {
			"tree-directory": DirectoryElementProps;
			"tree-file": FileElementProps;
			"tree-class": ClassCodeElementProps;
			"tree-function": CodeElementProps;
			"tree-constant": CodeElementProps;
			"tree-method": CodeElementProps;
			"tree-property": CodeElementProps;
			"tree-type": CodeElementProps;
			"tree-interface": ClassCodeElementProps;
		}
	}
}

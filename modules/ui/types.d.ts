declare module "*.module.css" {
	/** A normal CSS file import is just a string file path. */
	const CSSFile: string;

	/** A CSS module import is a record of class names to their resolved local identifiers. */
	const CSSModule: { readonly [className: string]: string | undefined };

	// In some environments, CSS modules are supported and will be imported as an object mapping class names to their generated identifiers.
	// In other environments, they may just be imported as a string file path. To accommodate both cases, we can use a union type.
	// Our CSS helper utilities are designed to work with either format, so we can allow both types in the declaration.
	const CSSFileOrModule: CSSFile | CSSModule;
	export default CSSFileOrModule;
}

declare module "*.css" {
	/** A normal CSS file import is just a string file path. */
	const CSSFile: string;

	export default CSSFile;
}

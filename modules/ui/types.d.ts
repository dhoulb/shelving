declare module "*.module.css" {
	const styles: { readonly [className: string]: string };
	export default styles;
}

declare module "*.css" {
	const css: string;
	export default css;
}

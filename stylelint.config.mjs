/** @type {import("stylelint").Config} */
export default {
	extends: ["stylelint-config-standard"],
	referenceFiles: ["modules/ui/style/*.css"],
	rules: {
		"no-unknown-custom-properties": true,
		"no-unknown-animations": true,
		"no-unknown-custom-media": true,
		"no-descending-specificity": null,
		// CSS modules: `:global(.tint)` keeps a class name unhashed.
		"selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }],
	},
	ignoreFiles: ["**/node_modules/**", "**/.dist/**"],
};

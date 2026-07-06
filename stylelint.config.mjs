/** @type {import("stylelint").Config} */
export default {
	extends: ["stylelint-config-standard"],
	referenceFiles: ["modules/ui/style/*.css", "modules/ui/**/!(*.module).css"],
	rules: {
		"no-unknown-custom-properties": true,
		"no-unknown-animations": true,
		"no-unknown-custom-media": true,
		"no-descending-specificity": null,
	},
	ignoreFiles: ["**/node_modules/**", "**/.dist/**"],
};

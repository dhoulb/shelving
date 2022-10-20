/** @type import("@jest/types").Config.InitialOptions */
const config = {
	roots: ["./modules"],
	collectCoverage: false,
	transform: {
		"^.+\\.(js|ts)$": [
			"esbuild-jest",
			{
				sourcemap: true,
			},
		],
	},
	resolver: "jest-ts-webcompat-resolver",
};
module.exports = config;

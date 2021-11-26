/** @type import("@jest/types").Config.InitialOptions */
const config = {
	roots: ["./dist"],
	collectCoverage: false,
	transform: {}, // Disable Babel transformations.
};
module.exports = config;

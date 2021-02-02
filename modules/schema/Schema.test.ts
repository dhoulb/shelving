import { isSchema, string } from "..";

test("isSchema()", () => {
	// Yes.
	expect(isSchema(string.required)).toEqual(true);
	// No.
	expect(isSchema("a")).toEqual(false);
	expect(isSchema({})).toEqual(false);
	expect(isSchema({ validate: 123 })).toEqual(false);
});

import { data, DataSchema, DataSchemas, InvalidFeedback, number, Validator } from "..";

// Tests.
describe("DataSchema", () => {
	test("TypeScript validate()", () => {
		// Test object.optional()
		const dataSchema = data({ props: { num: number.optional } });
		const dataType: DataSchema<{ num: number | null }, DataSchemas, DataSchemas> = dataSchema;
		const dataValue: { num: number | null } | null = dataSchema.validate({ num: 123 });
		const dataPropSchema = dataSchema.props.num;
		const dataPropType: Validator<number | null> = dataPropSchema;
		const dataPropValue: number | null = dataPropSchema.validate(123);

		// Test empty `DataSchema` type.
		const checkType: DataSchema = dataSchema;
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = data({
				props: { num: number.optional },
				validator: props => {
					throw feedback;
				},
			});
			try {
				schema.validate({ num: 123 });
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});

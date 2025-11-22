import { convertFilledToBlob, testTemplateConstructor } from "./test.utils";
import lattebun, { type LatteBun } from "..";
import { expect, test } from "bun:test";

test("Empty Template String", async () => {
	const testTemplate: LatteBun.Template = new lattebun.templateString("");
	testTemplateConstructor(testTemplate);

	const filledTestTemplate = testTemplate.fill({ fillin: "FAIL" });
	const filledOutput = await convertFilledToBlob(filledTestTemplate);

	const filledBytes = await filledOutput.bytes();
	expect(filledBytes, `Empty template failed to convert to Uint8Array`).toBeDefined();
	expect(filledBytes, `Empty template failed to convert to Uint8Array`).toBeInstanceOf(Uint8Array);

	expect(filledBytes.length, `Empty template has data (erroneously)`).toBe(0);
});

test("No FillIn Template String", async () => {
	const testTemplate: LatteBun.Template = new lattebun.templateString("Template file with no fill in with the format \{\{fillin\}\}");
	testTemplateConstructor(testTemplate);

	const filledTestTemplate = testTemplate.fill({ fillin: "FAIL" });
	const filledOutput = await convertFilledToBlob(filledTestTemplate);

	const filledBytes = await filledOutput.bytes();
	expect(filledBytes, `Template failed to convert to Uint8Array`).toBeDefined();
	expect(filledBytes, `Template failed to convert to Uint8Array`).toBeInstanceOf(Uint8Array);

	expect(filledBytes.length, `Template has filled with no data (erroneously)`).not.toBe(0);
});

test("Simple Template File", async () => {
	const testTemplate: LatteBun.Template = new lattebun.templateString("This template should {{fillin}}");
	testTemplateConstructor(testTemplate);

	const filledTestTemplate = testTemplate.fill({
		fillin: "PASS",
		"{fillin}": "FAIL",
		"{{fillin}}": "FAIL",
	});
	const filledOutput = await convertFilledToBlob(filledTestTemplate);

	const filledString = await filledOutput.text();
	expect(filledString, `Template failed to convert to String`).toBeDefined();
	expect(filledString, `Template failed to convert to String`).toBeString();

	expect(filledString.length, `Template has filled with no data (erroneously)`).not.toBe(0);

	expect(filledString, "Template fillin keys are parsed incorrectly").toContain("PASS");
});

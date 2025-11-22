import { expect } from "bun:test";
import type { LatteBun } from "..";

export function testTemplateConstructor(tmplt: LatteBun.Template) {
	expect(tmplt, `Failed to make template`).toBeDefined();
	expect(tmplt.fill, `Template failed to make with ".fill"`).toBeFunction();
	expect(tmplt.bake, `Template failed to make with ".bake"`).toBeFunction();
}

export async function convertFilledToBlob(filledTestTemplate: LatteBun.DataStream) {
	expect(filledTestTemplate, `Template failed to fill`).toBeDefined();
	expect(filledTestTemplate, `Template failed to fill`).toBeInstanceOf(ReadableStream);

	const filledOutput = <Blob>await (<any>filledTestTemplate).blob();
	expect(filledOutput, `Template failed to convert to Blob`).toBeDefined();
	expect(filledOutput, `Template failed to convert to Blob`).toBeInstanceOf(Blob);
	
	return filledOutput;
}
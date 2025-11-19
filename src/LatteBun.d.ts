import type { BunFile } from "bun";

export namespace LatteBun {
	export type DataChunk = Uint8Array<ArrayBuffer>;
	export type DataStream = ReadableStream<DataChunk>;
	export type DataStreamReader = ReadableStreamDefaultReader<DataChunk>;

	export type templatePickableOnly = string | DataChunk | BunFile;
	export type templateBakeableOnly = DataStream;

	/** A datatype that can be filled in live while a site is operating */
	export type templateFillable = templatePickableOnly;
	/** A datatype that can be baked-in to cache a page while a site is operating */
	export type templateBakeable = templateBakeableOnly | templatePickableOnly;

	/**
	 * Used to describe the fill-ins of the template
	 *
	 * {@inheritdoc template}
	 */
	export type templateDescriptor = { [_: string]: templateFillable | templateDescriptor };

	/**
	 * Used to describe the fill-ins of the template to be baked
	 *
	 * {@inheritdoc bakedTemplate}
	 */
	export type bakeableTemplateDescriptor = { [_: string]: templateBakeable | bakeableTemplateDescriptor };

	/**
	 *
	 */
	export type templateOptions = {
		create(): DataStream | Promise<DataStream>;
	};
	
	/**
	 * 
	 */
	export type markdownOptions = {
		
	};
}

export async function convertToDataChunk(data: LatteBun.templateBakeable): Promise<DataChunk> {
	if (data instanceof Blob) {
		return await data.bytes();
	} else if (typeof data == "string") {
		return Uint8Array.from(data.split("").map(c => c.charCodeAt(0)));
	} else if (data instanceof Uint8Array) {
		return data;
	}
	return Uint8Array.from("undefined".split("").map(c => c.charCodeAt(0)));
}

export async function convertToBakedDataChunk(data: LatteBun.templateBakeable): Promise<DataChunk> {
	if (data instanceof ReadableStream) {
		return await (await data.blob()).bytes();
	}
	return await convertToDataChunk(data);
}
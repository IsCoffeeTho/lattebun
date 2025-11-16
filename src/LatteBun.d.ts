export namespace LatteBun {
	
	export type DataChunk = Uint8Array<ArrayBuffer>;
	export type DataStream = ReadableStream<DataChunk>;
	export type DataStreamReader = ReadableStreamDefaultReader<DataChunk>;
	
	export type templatePickableOnly = string | DataChunk;
	export type templateBakeableOnly = DataStream;
	
	
	/** A datatype that can be filled in live while a site is operating */
	export type templateFillable = templatePickableOnly;
	/** A datatype that can be baked-in to cache a page while a site is operating */
	export type templateBakeable = templateBakeableOnly | templatePickableOnly;

	/**
	 * Used to describe the fill-ins of the template
	 *
	 *
	 */
	export type templateDescriptor = { [_: string]: templateFillable | templateDescriptor };

	/**
	 * Used to describe the fill-ins of the template to be baked
	 *
	 * @inheritdoc template
	 */
	export type bakeableTemplateDescriptor = { [_: string]: bakedTemplateFillable | bakeableTemplateDescriptor };

	/**
	 *
	 */
	export type templateOptions = {
		create(): DataStream | Promise<DataStream>;
	};
}

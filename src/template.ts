import { BunFile } from "bun";
import { LatteBun } from "./LatteBun.d";

/**
 * A data structure that can read a stream and fill in templatable strings.
 * 
 * @example An input stream of
 * ```ts
 * // templateString extends template
 * var example = new templateString("Hello, {{name}}!");
 * example.fill({ name: "World" });
 * ```
 * Has the resulting stream:
 * ```
 * Hello, World!
 * ```
 */
export default class template implements LatteBun.Template {
	#createStream: () => LatteBun.DataStream | PromiseLike<LatteBun.DataStream>;
	constructor(options: LatteBun.templateOptions) {
		this.#createStream = options.create;
	}

	bake(fillable: LatteBun.bakeableTemplateDescriptor): LatteBun.Template {
		var baking: Promise<LatteBun.DataChunk> | undefined = convertToBakedDataChunk(this.fill(<LatteBun.templateDescriptor>fillable));
		var baked: LatteBun.DataChunk;
		return new template({
			create: async () => {
				if (baking) {
					baked = await baking;
					baking = undefined;
				}
				return new ReadableStream<LatteBun.DataChunk>({
					start: controller => {
						controller.enqueue(<LatteBun.DataChunk>baked);
						controller.close();
					},
				});
			},
		});
	}

	fill(fillable: LatteBun.templateDescriptor): LatteBun.DataStream {
		var templateStream: LatteBun.DataStream;
		var templateReader: LatteBun.DataStreamReader;

		const startDelim = "{".charCodeAt(0);
		const checkStartDelim = (v:number, i: number, a:Uint8Array) => v == startDelim && a[i + 1] == startDelim;
		const endDelim = "}".charCodeAt(0);
		const checkEndDelim = (v:number, i: number, a:Uint8Array) => v == endDelim && a[i + 1] == endDelim;

		const decoder = new TextDecoder();

		return new ReadableStream<LatteBun.DataChunk>({
			start: async () => {
				var templateStream_poss_async = this.#createStream();
				if (typeof (<any>templateStream_poss_async).then === "function") {
					templateStream = <LatteBun.DataStream>await templateStream_poss_async;
				} else {
					templateStream = <LatteBun.DataStream>templateStream_poss_async;
				}
				templateReader = <LatteBun.DataStreamReader>templateStream.getReader();
			},
			pull: async controller => {
				var chunk;
				while ((chunk = await templateReader.read()) && !chunk.done) {
					var templateBegin: number = -1;
					while ((templateBegin = chunk.value.findIndex(checkStartDelim)) > -1) {
						
						controller.enqueue(chunk.value.slice(0, templateBegin));
						chunk.value = chunk.value.slice(templateBegin);

						var templateEnd = chunk.value.findIndex(checkEndDelim);

						var keyString = decoder.decode(chunk.value.slice(2, templateEnd));
						var key = keyString.split(".");
						var tree: any = fillable;
						try {
							while (key.length > 0) {
								var keyPart = <string>key.shift();
								tree = <LatteBun.bakeableTemplateDescriptor>tree[keyPart];
							}
						} catch (err) {
							// @ts-ignore
							tree = undefined;
						}
						
						if (tree == undefined)
							tree = `{{${keyString}}}`;
						var value = <LatteBun.templateBakeable>tree;

						controller.enqueue(await convertToBakedDataChunk(value));

						chunk.value = chunk.value.slice(templateEnd + 2);
					}
					controller.enqueue(chunk.value);
				}
				templateReader.cancel();
				controller.close();
			},
			cancel: () => {
				templateReader.cancel();
			},
		});
	}
}

export async function convertToDataChunk(data: LatteBun.templateBakeable): Promise<LatteBun.DataChunk> {
	if (data instanceof Blob) {
		return await data.bytes();
	} else if (typeof data == "string") {
		return Uint8Array.from(data.split("").map(c => c.charCodeAt(0)));
	} else if (data instanceof Uint8Array) {
		return data;
	}
	return Uint8Array.from("undefined".split("").map(c => c.charCodeAt(0)));
}

export async function convertToBakedDataChunk(data: LatteBun.templateBakeable): Promise<LatteBun.DataChunk> {
	if (data instanceof ReadableStream)
		data = <BunFile>(await data.blob());
	return await convertToDataChunk(data);
}
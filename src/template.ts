import { convertToBakedDataChunk, type LatteBun } from "./LatteBun.d";

export default class template {
	#createStream: () => LatteBun.DataStream | PromiseLike<LatteBun.DataStream>;
	constructor(options: LatteBun.templateOptions) {
		this.#createStream = options.create;
	}

	bake(fillable: LatteBun.bakeableTemplateDescriptor): template {
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

	fill(fillable: LatteBun.templateDescriptor) {
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

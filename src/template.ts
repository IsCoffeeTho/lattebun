import { convertToBakedDataChunk, type LatteBun } from "./LatteBun.d";

export default class template {
	#createStream: () => LatteBun.DataStream | PromiseLike<LatteBun.DataStream>;
	constructor(options: LatteBun.templateOptions) {
		this.#createStream = options.create;
	}

	bake(fillable: LatteBun.bakeableTemplateDescriptor): template {
		var baking: Promise<LatteBun.DataChunk> | undefined = convertToBakedDataChunk(this.fill(<LatteBun.templateDescriptor>fillable));
		var baked: LatteBun.DataChunk;
		baking.then((v) => {
			baked = v;
			baking = undefined;
		})
		return new template({
			create: async () => {
				while (!baked);
				console.log(baked);
				return new ReadableStream<LatteBun.DataChunk>({
					start: controller => {
						controller.enqueue(<LatteBun.DataChunk>baked);
						controller.close();
					},
				});
			},
		})
	}

	fill(fillable: LatteBun.templateDescriptor) {
		var templateStream: LatteBun.DataStream;
		var templateReader: LatteBun.DataStreamReader;

		const startDelim = "{".charCodeAt(0);
		const endDelim = "}".charCodeAt(0);

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
					var templateBegin = chunk.value.findIndex((v, i, a) => v == startDelim && a[i + 1] == startDelim);
					if (templateBegin == -1) {
						controller.enqueue(chunk.value);
						continue;
					}

					controller.enqueue(chunk.value.slice(0, templateBegin));
					chunk.value = chunk.value.slice(templateBegin);

					var templateEnd = chunk.value.findIndex((v, i, a) => v == endDelim && a[i + 1] == endDelim);

					var key = decoder.decode(chunk.value.slice(2, templateEnd)).split(".");

					var tree: any = fillable;

					var prevKeys: string[] = [];
					try {
						while (key.length > 0) {
							var keyPart = <string>key.shift();
							prevKeys.push(keyPart);
							tree = <LatteBun.bakeableTemplateDescriptor>tree[keyPart];
						}
					} catch (err) {
						// @ts-ignore
						tree = undefined;
					}

					var value = <LatteBun.templateBakeable>tree;

					controller.enqueue(await convertToBakedDataChunk(value));

					chunk.value = chunk.value.slice(templateEnd + 2);
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

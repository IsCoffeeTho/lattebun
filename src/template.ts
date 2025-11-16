import bakedTemplate from "./bakedTemplate";
import type { LatteBun } from "./LatteBun";

export default class template {
	#createStream: () =>  LatteBun.DataStream | PromiseLike<LatteBun.DataStream>;
	constructor(options: LatteBun.templateOptions) {
		this.#createStream = options.create;
	}
	
	bake(fillable: LatteBun.bakeableTemplateDescriptor): bakedTemplate {
		return new bakedTemplate(this.fill(<LatteBun.templateDescriptor>fillable));
	}
	
	fill(fillable: LatteBun.templateDescriptor) {
		var templateStream: LatteBun.DataStream;
		var templateReader: LatteBun.DataStreamReader;
		return new ReadableStream<LatteBun.DataChunk>({
			start: async () => {
				var templateStream_poss_async = this.#createStream();
				if (typeof (<any>templateStream_poss_async).then === "function")
					templateStream = <LatteBun.DataStream>(await templateStream_poss_async);
				else
					templateStream = <LatteBun.DataStream>templateStream_poss_async;
				templateReader = <LatteBun.DataStreamReader>templateStream.getReader();
			},
			pull: async (controller) => {
				var chunk = await templateReader.read();
				while (!chunk.done) {
					console.log(chunk.value);
					controller.enqueue(chunk.value);
					chunk = await templateReader.read();
				}
				controller.close();
			},
			cancel: () => {
				templateReader.cancel();
			}
		})
	}
}
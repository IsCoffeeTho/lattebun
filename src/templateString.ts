import { convertToDataChunk, type LatteBun } from "./LatteBun";
import template from "./template";

export default class templateString extends template {
	constructor(str: string) {
		super({
			create() {
				return new ReadableStream<LatteBun.DataChunk>({
					start: async controller => {
						controller.enqueue(Uint8Array.from(str.split("").map(v => v.charCodeAt(0))));
						controller.close();
					},
				});
			},
		});
	}
}

import type { LatteBun } from "./LatteBun";

export default class bakedTemplate {
	constructor(data: LatteBun.templateBakeable) {
		
	}
	
	stream() {
		return new ReadableStream({
			start: async (_) => {
				
			},
			pull: async controller => {
				controller.enqueue(Uint8Array.from("TEST"));
				controller.close();
			}
		})
	}
}
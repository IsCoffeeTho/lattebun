import bakedTemplate from "./bakedTemplate";
import type { LatteBun } from "./LatteBun";
import template from "./template";

export default class templateFile extends template {
	constructor(file: string) {
		super({
			async create() {
				var file_t = Bun.file(file);
				if (!(await file_t.exists())) throw new Error("ENOENT");
				return file_t.stream();
			},
		});
	}
}

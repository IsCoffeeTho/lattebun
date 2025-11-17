import type { LatteBun } from "./LatteBun";
import template from "./template";

export default class templateFile extends template {
	constructor(filename: string) {
		super({
			async create() {
				var file = Bun.file(filename);
				if (!(await file.exists())) throw new Error("ENOENT");
				return file.stream();
			},
		});
	}
}

import type { LatteBun } from "./LatteBun";
import template from "./template";

/**
 * Builds a template from a file by the filename provided.
 * 
 * Inside these files you can state where 'fill-ins' should appear
 * ```
 * {{fillin}}!
 * ```
 * And describe it
 * ```ts
 * myTemplate.fill({
 * 	fillin: "Hello World"
 * })
 * ```
 * this particular template will result in
 * ```
 * Hello World!
 * ```
 */
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

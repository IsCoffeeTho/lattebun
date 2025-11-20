LatteBun
Welcome to LatteBun, a library that makes writing pages a lot less redundant.
To get started

Basic Example
```sh
# bash
bun install lattebun toastiebun
```

```ts
// example.ts
import toastiebun from "toastiebun";
import lattebun from "lattebun";

const app = new toastiebun.server();

const page = new lattebun.templateFile(`${__dirname}/page.html`);

app.get("/", (req, res) => {
	res.send("html").send(page.fill({
		"name": "World"
	}));
});

app.listen("::", 3000);
```

```html
<!-- page.html -->
<html>
	<body>
		Hello, {{name}}!
	</body>
</html>
```
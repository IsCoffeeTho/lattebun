import toastiebun from "toastiebun";
import lattebun from "..";

var _host = "127.0.0.1";
var _port = 3000;

if (process.argv.length > 2) {
	var colonSperator = (<string>process.argv[2]).indexOf(":");
	if (colonSperator == -1) _host = <string>process.argv[2];
	else {
		_host = (<string>process.argv[2]).slice(0, colonSperator);
		_port = parseInt((<string>process.argv[2]).slice(colonSperator + 1));
	}
}

if (process.argv.length > 3) {
	_port = parseInt(<string>process.argv[3]);
}
const app = new toastiebun.server();

app.get("/static/*", (req, res) => {
	res.sendStatic(`${__dirname}${req.path}`);
});

const skeleton = new lattebun.templateFile(`${__dirname}/pages/skeleton.html`);

const genHeaderLinks = (req: any) => {
	const pages: { [_: string]: string } = {
		Home: "/",
		About: "/about",
		Credit: "/credit"
	};
	var retval = [];
	for (var page in pages) {
		var link = <string>pages[page];
		retval.push(`<a href="${link}" ${req.path == link ? "current" : ""}>${page}</a>`);
	}
	return retval.join("");
};


app.get("/", (req, res) => {
	var data = skeleton.fill({
		headerLink: genHeaderLinks(req),
		content: Bun.file(`${__dirname}/pages/landing.html`),
		announcement: "",
	});
	res.type("html").send(data);
});

app.get("/about", (req, res) => {
	var data = skeleton.fill({
		headerLink: genHeaderLinks(req),
		content: Bun.file(`${__dirname}/pages/about.html`),
		announcement: "",
	});
	res.type("html").send(data);
});

const examplePage = new lattebun.templateString(
`<html>
	<body>
		Hello, {{name}}!
	</body>
</html>`
);

app.get("/example", (req, res) => {
	res.type("html").send(examplePage.fill({
		name: "World"
	}))
})

app.get("/*", (req, res) => {
	var data = skeleton.fill({
		headerLink: genHeaderLinks(req),
		content: Bun.file(`${__dirname}/pages/404.html`),
		announcement: "",
	});
	res.status(404).type("html").send(data);
});

app.listen(_host, _port, server => {
	console.log(`Hosting server @ ${server.host}:${server.port}`);
});

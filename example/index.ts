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
})

const skeleton = new lattebun.templateFile(`${__dirname}/pages/skeleton.html`);

const landing = skeleton.bake({
	content: Bun.file(`${__dirname}/pages/landing.html`)
});

app.get("/", (req, res) => {
	var data = landing.fill({});
	res.type("html").send(data);
});


app.listen(_host, _port, server => {
	console.log(`Hosting server @ ${server.host}:${server.port}`);
});
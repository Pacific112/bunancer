const server = Bun.serve({
	static: {
		"/health": new Response("OK!"),
	},
	fetch: () => {
		console.log(`[${Date.now()}] accessed server`);
		return new Response(`Hello from server-${Bun.env.SERVER_IDENTIFIER}`);
	},
});

await fetch("http://localhost:40999/register", {
	method: "POST",
	body: JSON.stringify({
		id: Bun.env.SERVER_IDENTIFIER,
		port: server.port + "",
		host: `http://${server.hostname}`,
	}),
});

console.log(
	`[${new Date().toISOString()}] Server ${Bun.env.SERVER_IDENTIFIER} started`,
);
console.log(`[${new Date().toISOString()}] Listening on ${server.port}`);

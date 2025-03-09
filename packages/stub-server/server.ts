let statusCode = 200;

const server = Bun.serve({
	static: {
		"/health": new Response("OK!"),
	},
	fetch: () => {
		console.log(`[${Date.now()}] accessed server`);
		if (statusCode === 200) {
			return new Response(`Hello from server-${Bun.env.SERVER_IDENTIFIER}`, {
				status: statusCode,
			});
		}

		return new Response(null, { status: statusCode });
	},
});

// if (Bun.env.SOCKET_PATH) {
Bun.serve({
	unix: "./stubs/sockets/maciek-test.sock",
	fetch: async (req) => {
		const [message, value] = (await req.text()).split(":");
		if (message === "status_code") {
			const newValue = parseInt(value, 10);
			if (Number.isInteger(newValue)) {
				statusCode = newValue;
			}
		}

		return new Response();
	},
});
console.log("STARTED SOCKET");
// }

// await fetch("http://localhost:40999/register", {
// 	method: "POST",
// 	body: JSON.stringify({
// 		id: Bun.env.SERVER_IDENTIFIER,
// 		port: server.port + "",
// 		host: `http://${server.hostname}`,
// 	}),
// });

console.log(
	`[${new Date().toISOString()}] Server ${Bun.env.SERVER_IDENTIFIER} started`,
);
console.log(`[${new Date().toISOString()}] Listening on ${server.port}`);

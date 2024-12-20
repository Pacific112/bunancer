Bun.serve({
	static: {
		"/health": new Response("OK!")
	},
	fetch: () => {
		console.log(`[${Date.now()}] accessed server`);
		return new Response(`Hello from server-${Bun.env.SERVER_NUMBER}`);
	},
});

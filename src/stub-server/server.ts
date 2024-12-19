Bun.serve({
	fetch: () => {
		console.log("accessed server")
		return new Response(`Hello from server-${Bun.env.SERVER_NUMBER}`);
	},
});

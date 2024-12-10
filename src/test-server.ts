Bun.serve({
	fetch: () => {
		return new Response(`Hello from server-${Bun.env.SERVER_NUMBER}`);
	},
});

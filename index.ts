import { loadConfig } from "load-balancer/config.ts";
import { initializePool } from "load-balancer/server-pool.ts";
import { startLoadBalancer } from "load-balancer/load-balancer.ts";
import { serverSchema } from "load-balancer/config-schema.ts";

const config = await loadConfig();
const serverPool = initializePool(config);
const { routeRequest } = startLoadBalancer(serverPool);

Bun.serve({
	fetch(request) {
		return routeRequest(request);
	},
});

Bun.serve({
	port: 40999,
	async fetch(request) {
		if (request.method === "POST" && request.url.endsWith("/register")) {
			const parsedConfig = await serverSchema.safeParseAsync(
				await request.json(),
			);
			if (parsedConfig.success) {
				const result = serverPool.addServer(parsedConfig.data);
				return result.ok
					? new Response()
					: new Response(result.error, { status: 400 });
			}
			return new Response(
				`Cannot parse config: ${parsedConfig.error.message}`,
				{
					status: 400,
				},
			);
		}

		return new Response("Not Found!", { status: 404 });
	},
});

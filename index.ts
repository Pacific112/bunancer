import { loadConfig } from "load-balancer/config.ts";
import { initializePool, toUrl } from "load-balancer/server-pool.ts";
import { startLoadBalancer } from "load-balancer/load-balancer.ts";
import {
	type ServerConfig,
	serverSchema,
} from "load-balancer/config-schema.ts";
import { undefined } from "zod";

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

const textEncoder = new TextEncoder();
Bun.serve({
	port: 41234,
	async fetch(request) {
		if (request.method === "GET" && request.url.endsWith("/status")) {
			const res = new Response(
				JSON.stringify({
					serverPools: [
						{
							id: "pool1",
							name: "Test",
							servers: serverPool.allServers.map((s) => ({
								id: s.id,
								name: s.id,
								status: s.status,
								ip: toUrl(s),
							})),
						},
					],
				}),
			);
			res.headers.set("Access-Control-Allow-Origin", "*");
			res.headers.set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, DELETE, OPTIONS",
			);
			return res;
		}
		if (request.method === "GET" && request.url.endsWith("/sse")) {
			let timerId: Timer | undefined = undefined;
			let listener: (s: ServerConfig) => void;
			const res = new Response(
				new ReadableStream({
					start: (controller) => {
						listener = (s) => {
							controller.enqueue(
								textEncoder.encode(
									`event: new-server\ndata: ${JSON.stringify({
										id: s.id,
										name: s.id,
										status: "online",
										ip: toUrl(s),
									})}\n\n`,
								),
							);
						};
						serverPool.eventEmitter.on("new-server", listener);
						timerId = setInterval(() => {
							controller.enqueue(
								textEncoder.encode(`event: ping\ndata: ping\n\n`),
							);
						}, 5000);
					},
					cancel: () => {
						if (timerId) {
							clearInterval(timerId);
						}
						if (listener) {
							serverPool.eventEmitter.off("new-server", listener);
						}
					},
				}),
			);
			res.headers.set("Access-Control-Allow-Origin", "*");
			res.headers.set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, DELETE, OPTIONS",
			);
			res.headers.set("Content-Type", "text/event-stream");
			res.headers.set("Cache-Control", "no-cache");

			return res;
		}

		return new Response("Not Found!", { status: 404 });
	},
});

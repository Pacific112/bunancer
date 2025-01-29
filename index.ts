import { loadConfig } from "load-balancer/config.ts";
import { initializePool, toUrl } from "load-balancer/server-pool.ts";
import { startLoadBalancer } from "load-balancer/load-balancer.ts";
import {
	type ServerConfig,
	serverSchema,
} from "load-balancer/config-schema.ts";
import { sse, type SseSetup } from "load-balancer/sse.ts";
import { cors } from "load-balancer/cors.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";
import { destroy, get, post, router } from "load-balancer/router.ts";
import { runServer } from "stub-server/sdk.ts";
import { z } from "zod";

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
	fetch: router(
		post("/register", serverSchema, (body) => {
			const result = serverPool.addServer(body);
			return result.ok
				? new Response()
				: new Response(result.error, { status: 400 });
		}),
	),
});

const statusHandler = () => {
	return new Response(
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
};

const sseHandler: SseSetup = (enqueue) => {
	const newServerListener = (s: ServerConfig) =>
		enqueue({
			name: "new-server",
			data: {
				id: s.id,
				name: s.id,
				status: "online",
				ip: toUrl(s),
			},
		});
	const serverOnlineListener = (id: string) =>
		enqueue({ name: "server-online", data: id });
	const serverOfflineListener = (id: string) =>
		enqueue({ name: "server-offline", data: id });

	globalEmitter.on("pool:new-server", newServerListener);
	globalEmitter.on("pool:server-online", serverOnlineListener);
	globalEmitter.on("pool:server-offline", serverOfflineListener);
	return () => {
		globalEmitter.off("pool:new-server", newServerListener);
		globalEmitter.off("pool:server-online", serverOnlineListener);
		globalEmitter.off("pool:server-offline", serverOfflineListener);
	};
};

Bun.serve({
	port: 41234,
	fetch: cors(
		router(
			get("/status", statusHandler),
			get("/sse", sse(sseHandler)),
			post(
				"/servers",
				z.object({
					instanceId: z.string(),
					port: z.string().regex(/\d+/),
				}),
				async (body) => {
					await runServer(body);
					return new Response();
				},
			),
			destroy("/servers/:id", ({ pathParams }) => {
				return new Response();
			}),
		),
	),
});

import { loadConfig } from "load-balancer/config.ts";
import {
	initializePool,
	type PendingServer,
	toUrl,
} from "load-balancer/server-pool.ts";
import { startLoadBalancer } from "load-balancer/load-balancer.ts";
import { serverSchema } from "load-balancer/config-schema.ts";
import { sse, type SseSetup } from "load-balancer/sse.ts";
import { cors } from "load-balancer/cors.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";
import { destroy, get, post, router } from "load-balancer/router.ts";
import {
	loadRunningServers,
	runServer,
	serverLogs,
	stopServer,
} from "stub-server/sdk.ts";
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
						id: s.config.id,
						name: s.config.id,
						status: s.status,
						ip: toUrl(s),
					})),
				},
			],
		}),
	);
};

const sseHandler: SseSetup = (enqueue) => {
	const newServerListener = (s: PendingServer) =>
		enqueue({
			name: "new-server",
			data: {
				id: s.id,
				name: s.id,
				status: "pending",
				ip: toUrl(s),
			},
		});
	const serverOnlineListener = (id: string) =>
		enqueue({ name: "server-online", data: id });
	const serverOfflineListener = (id: string) =>
		enqueue({ name: "server-offline", data: id });
	const serverKilledListener = (id: string) =>
		enqueue({ name: "server-dead", data: id });

	globalEmitter.on("pool:new-server", newServerListener);
	globalEmitter.on("pool:server-online", serverOnlineListener);
	globalEmitter.on("pool:server-offline", serverOfflineListener);
	globalEmitter.on("pool:server-killed", serverKilledListener);
	return () => {
		globalEmitter.off("pool:new-server", newServerListener);
		globalEmitter.off("pool:server-online", serverOnlineListener);
		globalEmitter.off("pool:server-offline", serverOfflineListener);
		globalEmitter.off("pool:server-killed", serverKilledListener);
	};
};

Bun.serve({
	port: 41234,
	fetch: cors(
		router(
			get("/status", statusHandler),
			get("/sse", sse(sseHandler)),
			get("/servers/:id/logs", async ({ pathParams }) => {
				const runningServers = await loadRunningServers();
				const selectedServer = runningServers.find(
					(r) => r.instanceId === pathParams.id,
				);
				if (!selectedServer) {
					return new Response(null, {
						status: 404,
					});
				}

				const logs = await serverLogs(selectedServer);
				return new Response(JSON.stringify({ logs }));
			}),
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
			destroy("/servers/:id", async ({ pathParams }) => {
				const runningServers = await loadRunningServers();
				const selectedServer = runningServers.find(
					(r) => r.instanceId === pathParams.id,
				);
				if (!selectedServer) {
					return new Response(
						JSON.stringify({ error: "Server is not running" }),
						{
							status: 400,
						},
					);
				}
				await stopServer(selectedServer);
				return new Response();
			}),
		),
	),
});

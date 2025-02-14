import { loadConfig } from "load-balancer/config/static-config.ts";
import { initializePool } from "load-balancer/pool/server-pool.ts";
import { startLoadBalancer } from "load-balancer/load-balancer.ts";
import { serverSchema } from "load-balancer/config/config-schema.ts";
import { sse, type SseSetup } from "load-balancer/middlewares/sse.ts";
import { cors } from "load-balancer/middlewares/cors.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";
import { destroy, get, post, router } from "load-balancer/routing/router.ts";
import { runServer, serverLogs, stopServer } from "stub-server/sdk.ts";
import { z } from "zod";
import {
	type PendingServer,
	type ServerStats,
	toUrl,
} from "load-balancer/pool/server.types.ts";
import { ServerStateStorage } from "load-balancer/storage/server-state-storage.ts";

const config = await loadConfig();
const serverStateStorage = new ServerStateStorage();

const poolServers = await serverStateStorage.loadState();
const serverPool = initializePool(poolServers, config);

const { routeRequest } = startLoadBalancer(serverPool, (servers) =>
	serverStateStorage.saveState(servers),
);

Bun.serve({
	fetch(request) {
		return routeRequest(request);
	},
});

Bun.serve({
	port: 40999,
	fetch: router(
		post("/register", serverSchema, async (body) => {
			const result = await serverPool.addServer(body);
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
					servers: serverPool.status.servers.map((s) => ({
						id: s.id,
						name: s.id,
						status: s.status,
						ip: toUrl(s),
						stats: serverPool.status.stats.get(s.id),
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
	const statsUpdateListener = (data: Record<string, ServerStats>) =>
		enqueue({ name: "stats-update", data });

	globalEmitter.on("pool:new-server", newServerListener);
	globalEmitter.on("pool:server-online", serverOnlineListener);
	globalEmitter.on("pool:server-offline", serverOfflineListener);
	globalEmitter.on("pool:server-killed", serverKilledListener);
	globalEmitter.on("pool:stats-update", statsUpdateListener);
	return () => {
		globalEmitter.off("pool:new-server", newServerListener);
		globalEmitter.off("pool:server-online", serverOnlineListener);
		globalEmitter.off("pool:server-offline", serverOfflineListener);
		globalEmitter.off("pool:server-killed", serverKilledListener);
		globalEmitter.off("pool:stats-update", statsUpdateListener);
	};
};

Bun.serve({
	port: 41234,
	fetch: cors(
		router(
			get("/status", statusHandler),
			get("/sse", sse(sseHandler)),
			get("/servers/:id/logs", async ({ pathParams }) => {
				const result = await serverLogs(pathParams.id);
				if (!result.ok) {
					return new Response(null, { status: 404 });
				}
				return new Response(JSON.stringify({ logs: result.data }));
			}),
			post(
				"/pools/:poolId/servers",
				z.object({
					instanceId: z.string(),
					port: z.string().regex(/\d+/),
				}),
				async (body, { pathParams: { poolId } }) => {
					// TODO Figure out how to support poolId
					await runServer(body);
					return new Response();
				},
			),
			destroy("/servers/:id", async ({ pathParams }) => {
				const result = await stopServer(pathParams.id);
				if (result.ok) {
					return new Response();
				}

				return new Response(null, { status: 404 });
			}),
		),
	),
});

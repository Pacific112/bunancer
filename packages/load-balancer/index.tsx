import { loadConfig } from "@/config/static-config";
import { initializePool } from "@/pool/server-pool";
import { startLoadBalancer } from "@/load-balancer";
import { serverSchema } from "@/config/config-schema";
import { sse, type SseSetup } from "@/middlewares/sse";
import { cors } from "@/middlewares/cors";
import { globalEmitter } from "@/global-emitter";
import { destroy, get, post, router } from "@/routing/router";
import { runServer, serverLogs, stopServer } from "stub-server";
import { z } from "zod";
import {
	type PendingServer,
	type ServerStats,
	toUrl,
} from "@/pool/server.types";
import { ServerStateStorage } from "@/storage/server-state-storage";
import { renderToReadableStream } from "react-dom/server";
import App from "ui/App.tsx";
import { publicFolder } from "@/routing/public-folder.ts";

await Bun.build({
	entrypoints: ["./packages/load-balancer/ui/main.tsx"],
	outdir: "./packages/load-balancer/public",
});

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
	development: true,
	fetch: cors(
		router(
			publicFolder(),
			get("/dashboard", async () => {
				const initialServerPools = [
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
				];
				const stream = await renderToReadableStream(
					<App initialServerPools={initialServerPools} />,
					{
						bootstrapModules: ["/public/main.js"],
						bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${JSON.stringify({ initialServerPools })};`,
					},
				);
				return new Response(stream);
			}),
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

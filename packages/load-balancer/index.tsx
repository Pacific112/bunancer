import { loadConfig } from "@/config/static-config";
import { initializePool } from "@/pool/server-pool";
import { startLoadBalancer } from "@/load-balancer";
import { serverSchema } from "@/config/config-schema";
import { sse, type SseSetup } from "@/middlewares/sse";
import { cors } from "@/middlewares/cors";
import { globalEmitter } from "@/global-emitter";
import { destroy, get, post, router } from "@/routing/router";
import { runServer, serverLogs, stopServer } from "stub-server";
import {
	type PendingServer,
	type ServerStats,
	toUrl,
} from "@/pool/server.types";
import { ServerStateStorage } from "@/storage/server-state-storage";
import {
	DEFAULT_PUBLIC_FOLDER_PATH,
	publicFolder,
} from "@/routing/public-folder.ts";
import TailwindBunPlugin from "bun-plugin-tailwind";
import { renderPage } from "@/routing/render-page.tsx";
import { serializeAuthCookie } from "@/middlewares/auth.ts";
import { createServerSchema, type ServerEvent } from "api/schema.ts";

const buildResult = await Bun.build({
	entrypoints: [
		"./packages/load-balancer/ui/main.tsx",
		"./packages/load-balancer/ui/index.css",
	],
	outdir: "./packages/load-balancer/public",
	plugins: [TailwindBunPlugin],
	minify: process.env.NODE_ENV === "production",
	naming: "[dir]/[name]-[hash].[ext]",
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

const sseHandler: SseSetup<ServerEvent> = (enqueue) => {
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

const ALLOWED_PATHS = [
	"/",
	"/unauthorized",
	"/not-found",
	"/faq",
	"/roadmap",
	"/not-found",
	"/invitations/*",
	`${DEFAULT_PUBLIC_FOLDER_PATH}/*`,
];
Bun.serve({
	port: 41234,
	fetch: cors(
		router(
			publicFolder(buildResult),
			renderPage("/", buildResult),
			renderPage("/dashboard", buildResult, (request) => ({
				initialServerPools: [
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
				initialMode: new URL(request.url).searchParams.get("mode") || "table",
				initialStats: serverPool.status.stats,
			})),
			renderPage("/faq", buildResult),
			renderPage("/roadmap", buildResult),
			renderPage("/not-found", buildResult),
			renderPage("/unauthorized", buildResult),
			get("/sse", sse(sseHandler)),
			get("/invitations/:id", ({ pathParams }) => {
				return new Response(null, {
					status: 307,
					headers: {
						"Set-Cookie": serializeAuthCookie(pathParams.id),
						Location: "/dashboard",
					},
				});
			}),
			get("/servers/:id/logs", async ({ pathParams }) => {
				const result = await serverLogs(pathParams.id);
				if (!result.ok) {
					return new Response(null, { status: 404 });
				}
				return Response.json({ logs: result.data });
			}),
			post(
				"/pools/:poolId/servers",
				createServerSchema,
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

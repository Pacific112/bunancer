import { useEffect, useState } from "react";
import type {
	CreateServer,
	ServerPool as ServerPoolType,
	ServerStats,
} from "$/types/types.ts";
import { DashboardSummary } from "$/components/dashboard-summary.tsx";
import { ServerPool } from "$/components/server-pool.tsx";
import { ServerFlow } from "$/components/server-flow.tsx";

function App({
	stylesheets = [],
	initialServerPools,
}: {
	stylesheets: string[];
	initialServerPools: ServerPoolType[];
}) {
	const [serverPools, setServerPools] = useState(initialServerPools);
	const [serverStats, setServerStats] = useState<Record<string, ServerStats>>(
		{},
	);

	useEffect(() => {
		const source = new EventSource("http://localhost:41234/sse");
		source.addEventListener("new-server", (e) => {
			const parsedServer = JSON.parse(e.data);
			return setServerPools(([ss]) => {
				const servIndex = ss.servers.findIndex((s) => s.id === parsedServer.id);
				return [
					{
						...ss,
						servers:
							servIndex === -1
								? [...ss.servers, parsedServer]
								: ss.servers.toSpliced(servIndex, 1, parsedServer),
					},
				];
			});
		});
		source.addEventListener("server-online", (e) => {
			const eid = JSON.parse(e.data);
			setServerPools((ss) =>
				ss.map((p) => ({
					...p,
					servers: p.servers.map((s) =>
						s.id === eid ? { ...s, status: "healthy" } : s,
					),
				})),
			);
		});
		source.addEventListener("server-offline", (e) => {
			const eid = JSON.parse(e.data);
			setServerPools((ss) =>
				ss.map((p) => ({
					...p,
					servers: p.servers.map((s) => {
						return s.id === eid ? { ...s, status: "unhealthy" } : s;
					}),
				})),
			);
		});
		source.addEventListener("server-dead", (e) => {
			const eid = JSON.parse(e.data);
			setServerPools((ss) =>
				ss.map((p) => ({
					...p,
					servers: p.servers.map((s) => {
						return s.id === eid ? { ...s, status: "dead" } : s;
					}),
				})),
			);
		});
		source.addEventListener("stats-update", (e) => {
			const statsUpdate = JSON.parse(e.data);
			setServerStats((stats) => ({ ...stats, ...statsUpdate }));
		});

		return () => source.close();
	}, []);

	const handleAddServer = (
		serverPool: ServerPoolType,
		newServer: CreateServer,
	) => {
		setServerPools((prevPools) =>
			prevPools.map((pool) =>
				pool.id === serverPool.id
					? {
							...pool,
							servers: [
								...pool.servers,
								{
									id: newServer.instanceId,
									responseTime: 0,
									ip: `http://localhost:${newServer.port}`,
									status: "pending",
									name: newServer.instanceId,
									load: 0,
								},
							],
						}
					: pool,
			),
		);

		fetch(`http://localhost:41234/pools/${serverPool.id}/servers`, {
			body: JSON.stringify(newServer),
			method: "POST",
		});
	};

	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{stylesheets.map((s) => (
					<link rel="stylesheet" key={s} href={s}></link>
				))}
				<title>My app</title>
			</head>
			<body>
				<div className="container mx-auto p-4">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold">
							Load Balancer Admin Dashboard
						</h1>
					</div>
					<DashboardSummary serverPools={serverPools} />
					{serverPools.map((pool) => (
						<ServerPool
							key={pool.id}
							pool={pool}
							onAddServer={handleAddServer}
						/>
					))}
					{serverPools[0] && (
						<ServerFlow
							stats={serverStats}
							serverPools={serverPools}
							onAddServer={handleAddServer}
						/>
					)}
				</div>
			</body>
		</html>
	);
}

export default App;

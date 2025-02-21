import { useEffect, useState } from "react";
import type {
	CreateServer,
	ServerPool as ServerPoolType,
	ServerStats,
} from "$/types/types.ts";
import { DashboardSummary } from "$/components/dashboard-summary.tsx";
import { ServerPool } from "$/components/server-pool.tsx";
import { ServerFlow } from "$/components/server-flow.tsx";
import { useServerPools } from "$/useServerPools.ts";

function App({
	stylesheets = [],
	initialServerPools,
}: {
	stylesheets: string[];
	initialServerPools: ServerPoolType[];
}) {
	const [{ serverPools }, dispatch] = useServerPools(initialServerPools);
	const [serverStats, setServerStats] = useState<Record<string, ServerStats>>(
		{},
	);

	useEffect(() => {
		const source = new EventSource("/sse");
		source.addEventListener("new-server", (e) => {
			const parsedServer = JSON.parse(e.data);
			dispatch({ name: "new_server", payload: parsedServer });
		});
		source.addEventListener("server-online", (e) => {
			const serverId = JSON.parse(e.data);
			dispatch({
				name: "mark_healthy",
				payload: { poolId: serverPools[0].id, serverId },
			});
		});
		source.addEventListener("server-offline", (e) => {
			const serverId = JSON.parse(e.data);
			dispatch({
				name: "mark_unhealthy",
				payload: { poolId: serverPools[0].id, serverId },
			});
		});
		source.addEventListener("server-dead", (e) => {
			const serverId = JSON.parse(e.data);
			dispatch({
				name: "mark_dead",
				payload: { poolId: serverPools[0].id, serverId },
			});
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
		dispatch({
			name: "new_server",
			payload: {
				poolId: serverPool.id,
				server: {
					id: newServer.instanceId,
					ip: `http://localhost:${newServer.port}`,
					status: "pending",
					name: newServer.instanceId,
				},
			},
		});

		fetch(`/pools/${serverPool.id}/servers`, {
			body: JSON.stringify(newServer),
			method: "POST",
		});
	};

	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{stylesheets.map((link) => (
					<link rel="stylesheet" key={link} href={link}></link>
				))}
				<title>Buniter</title>
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

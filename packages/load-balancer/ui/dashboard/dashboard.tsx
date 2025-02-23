import { useServerPools } from "$/lib/useServerPools.ts";
import { useState } from "react";
import {
	type CreateServer,
	type ServerPool as ServerPoolType,
	serverSchema,
	type ServerStats,
	serverStatsSchema,
} from "$/types/types.ts";
import { useServerSentEvent } from "$/lib/useServerSentEvent.ts";
import z from "zod";
import { ServerPool } from "$/dashboard/pools/server-pool.tsx";
import { ServerFlow } from "$/dashboard/graph/server-flow.tsx";
import { Summary } from "$/dashboard/summary.tsx";

export const Dashboard = ({
	initialServerPools,
}: {
	initialServerPools: ServerPoolType[];
}) => {
	const [{ serverPools }, dispatch] = useServerPools(initialServerPools);
	const [serverStats, setServerStats] = useState<Record<string, ServerStats>>(
		{},
	);

	const poolId = serverPools[0].id;

	useServerSentEvent({
		url: "/sse",
		events: {
			"new-server": {
				schema: serverSchema,
				handler: (server) =>
					dispatch({ name: "new_server", payload: { poolId, server } }),
			},
			"server-online": {
				schema: z.string(),
				handler: (serverId) =>
					dispatch({ name: "mark_healthy", payload: { poolId, serverId } }),
			},
			"server-offline": {
				schema: z.string(),
				handler: (serverId) =>
					dispatch({ name: "mark_unhealthy", payload: { poolId, serverId } }),
			},
			"server-dead": {
				schema: z.string(),
				handler: (serverId) =>
					dispatch({ name: "mark_dead", payload: { poolId, serverId } }),
			},
			"stats-update": {
				schema: z.record(z.string(), serverStatsSchema),
				handler: (statsUpdate) =>
					setServerStats((stats) => ({ ...stats, ...statsUpdate })),
			},
		},
	});

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
		<main className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Load Balancer Dashboard</h1>
			</div>
			<Summary serverPools={serverPools} />
			{serverPools.map((pool) => (
				<ServerPool key={pool.id} pool={pool} onAddServer={handleAddServer} />
			))}
			{serverPools[0] && (
				<ServerFlow
					stats={serverStats}
					serverPools={serverPools}
					onAddServer={handleAddServer}
				/>
			)}
		</main>
	);
};

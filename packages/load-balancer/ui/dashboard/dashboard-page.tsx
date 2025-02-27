import { useViewMode, ViewMode } from "$/lib/useViewMode.ts";
import PageLayout from "$/PageLayout.tsx";
import type {
	CreateServer,
	ServerEvent,
	ServerPool as ServerPoolType,
	ServerStats,
} from "api/schema.ts";
import { useServerPools } from "$/lib/useServerPools.ts";
import { useState } from "react";
import { useServerSentEvent } from "$/lib/useServerSentEvent.ts";
import { Summary } from "$/dashboard/summary.tsx";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "$/components/ui/tabs.tsx";
import { NetworkIcon, TableIcon } from "lucide-react";
import { ServerFlow } from "$/dashboard/graph/server-flow.tsx";
import { ServerPool } from "$/dashboard/pools/server-pool.tsx";

function DashboardPage({
	stylesheets = [],
	initialMode,
	initialServerPools,
	initialStats,
}: {
	stylesheets: string[];
	initialMode: ViewMode;
	initialServerPools: ServerPoolType[];
	initialStats: Record<string, ServerStats>;
}) {
	const [mode, updateMode] = useViewMode(initialMode);
	const [{ serverPools }, dispatch] = useServerPools(initialServerPools);
	const [serverStats, setServerStats] = useState(initialStats);

	const poolId = serverPools[0].id;

	useServerSentEvent<ServerEvent>({
		url: "/sse",
		events: {
			"new-server": (server) =>
				dispatch({ name: "new_server", payload: { poolId, server } }),
			"server-online": (serverId) =>
				dispatch({ name: "mark_healthy", payload: { poolId, serverId } }),
			"server-offline": (serverId) =>
				dispatch({ name: "mark_unhealthy", payload: { poolId, serverId } }),
			"server-dead": (serverId) =>
				dispatch({ name: "mark_dead", payload: { poolId, serverId } }),
			"stats-update": (statsUpdate) =>
				setServerStats((stats) => ({ ...stats, ...statsUpdate })),
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
		<PageLayout stylesheets={stylesheets}>
			<Summary serverPools={serverPools} />
			<Tabs defaultValue={mode} className="w-full" onValueChange={updateMode}>
				<TabsList className="w-full justify-start border-b">
					<TabsTrigger value="table">
						<TableIcon className="h-4 w-4 mr-2" />
						<span>Table View</span>
					</TabsTrigger>
					<TabsTrigger value="flow">
						<NetworkIcon className="h-4 w-4 mr-2" />
						<span>Flow View</span>
					</TabsTrigger>
				</TabsList>
				<TabsContent value="table" className="space-y-4 mt-4">
					{serverPools.map((pool) => (
						<ServerPool
							key={pool.id}
							pool={pool}
							onAddServer={handleAddServer}
						/>
					))}
				</TabsContent>
				<TabsContent value="flow" className="mt-4">
					{serverPools[0] && (
						<ServerFlow
							stats={serverStats}
							serverPools={serverPools}
							onAddServer={handleAddServer}
						/>
					)}
				</TabsContent>
			</Tabs>
		</PageLayout>
	);
}

export default DashboardPage;

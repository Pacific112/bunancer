import { useEffect, useState } from "react";
import { CreateServer, ServerPool as ServerPoolType } from "@/types/types";
import { ServerPool } from "@/components/server-pool";
import { DashboardSummary } from "@/components/dashboard-summary";
import { ServerFlow } from "@/components/server-flow.tsx";

function App() {
	const [serverPools, setServerPools] = useState<ServerPoolType[]>([]);

	// TODO to be replaced by SSR
	useEffect(() => {
		fetch("http://localhost:41234/status")
			.then((r) => r.json())
			.then((r) => setServerPools(r.serverPools));
	}, []);

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

		return () => source.close();
	}, []);

	const handleAddServer = (poolId: string, newServer: CreateServer) => {
		setServerPools((prevPools) =>
			prevPools.map((pool) =>
				pool.id === poolId
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

		fetch("http://localhost:41234/servers", {
			body: JSON.stringify(newServer),
			method: "POST",
		});
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Load Balancer Admin Dashboard</h1>
			</div>
			<DashboardSummary serverPools={serverPools} />
			{serverPools.map((pool) => (
				<ServerPool key={pool.id} pool={pool} onAddServer={handleAddServer} />
			))}
			{serverPools[0] && (
				<ServerFlow
					servers={serverPools[0].servers}
					onAddServer={(server) => handleAddServer(serverPools[0].id, server)}
				/>
			)}
		</div>
	);
}

export default App;

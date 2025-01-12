import { useEffect, useState } from "react";
import { Server, ServerPool as ServerPoolType } from "@/types/types";
import { ServerPool } from "@/components/server-pool";
import { DashboardSummary } from "@/components/dashboard-summary";

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
		source.addEventListener("new-server", (e) =>
			setServerPools(([ss]) => [
				{
					...ss,
					servers: [...ss.servers, JSON.parse(e.data)],
				},
			]),
		);
		source.addEventListener("server-online", (e) => {
			const eid = JSON.parse(e.data);
			setServerPools((ss) =>
				ss.map((p) => ({
					...p,
					servers: p.servers.map((s) =>
						s.id === eid ? { ...s, status: "online" } : s,
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
						return s.id === eid ? { ...s, status: "offline" } : s;
					}),
				})),
			);
		});

		return () => source.close();
	}, []);

	console.log(serverPools);
	const handleAddServer = (poolId: string, newServer: Server) => {
		setServerPools((prevPools) =>
			prevPools.map((pool) =>
				pool.id === poolId
					? { ...pool, servers: [...pool.servers, newServer] }
					: pool,
			),
		);

		// Simulate server coming online after 3 seconds
		setTimeout(() => {
			setServerPools((prevPools) =>
				prevPools.map((pool) =>
					pool.id === poolId
						? {
								...pool,
								servers: pool.servers.map((server) =>
									server.id === newServer.id
										? {
												...server,
												status: "online",
												load: Math.floor(Math.random() * 50) + 30,
												responseTime: Math.floor(Math.random() * 100) + 50,
											}
										: server,
								),
							}
						: pool,
				),
			);
		}, 3000);
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
		</div>
	);
}

export default App;

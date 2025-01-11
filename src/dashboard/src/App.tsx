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

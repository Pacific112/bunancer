import "./App.css";
import { useState } from "react";
import { Server, ServerPool as ServerPoolType } from "@/types/types";
import { ServerPool } from "@/components/server-pool";
import { DashboardSummary } from "@/components/dashboard-summary";

// Initial mock data for server pools
const initialServerPools: ServerPoolType[] = [
	{
		id: "pool1",
		name: "Web Servers",
		servers: [
			{
				id: "web1",
				name: "Web Server 1",
				status: "online",
				ip: "192.168.1.10",
				load: 65,
				responseTime: 120,
			},
			{
				id: "web2",
				name: "Web Server 2",
				status: "online",
				ip: "192.168.1.11",
				load: 78,
				responseTime: 135,
			},
			{
				id: "web3",
				name: "Web Server 3",
				status: "online",
				ip: "192.168.1.12",
				load: 0,
				responseTime: 0,
			},
		],
	},
	{
		id: "pool2",
		name: "Application Servers",
		servers: [
			{
				id: "app1",
				name: "App Server 1",
				status: "online",
				ip: "192.168.2.10",
				load: 82,
				responseTime: 95,
			},
			{
				id: "app2",
				name: "App Server 2",
				status: "offline",
				ip: "192.168.2.11",
				load: 0,
				responseTime: 0,
			},
		],
	},
	{
		id: "pool3",
		name: "Database Servers",
		servers: [
			{
				id: "db1",
				name: "DB Server 1",
				status: "online",
				ip: "192.168.3.10",
				load: 45,
				responseTime: 75,
			},
			{
				id: "db2",
				name: "DB Server 2",
				status: "online",
				ip: "192.168.3.11",
				load: 52,
				responseTime: 80,
			},
		],
	},
];

function App() {
	const [serverPools, setServerPools] = useState(initialServerPools);

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

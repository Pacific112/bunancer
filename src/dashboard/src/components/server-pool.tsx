import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerStatus } from "@/components/server-status";
import { AddServerForm } from "@/components/add-server-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Server, ServerPool } from "@/types/types";

interface ServerPoolProps {
	pool: ServerPool;
	onAddServer: (poolId: string, server: Server) => void;
}

export function ServerPool({ pool, onAddServer }: ServerPoolProps) {
	const [showAddForm, setShowAddForm] = useState(false);
	const [newServers, setNewServers] = useState<string[]>([]);

	const onlineServers = pool.servers.filter(
		(server) => server.status === "online",
	).length;
	const totalServers = pool.servers.length;

	const handleAddServer = (server: Server) => {
		onAddServer(pool.id, server);
		setNewServers((prev) => [...prev, server.id]);
		setShowAddForm(false);

		// Simulate server coming online after 3 seconds
		setTimeout(() => {
			setNewServers((prev) => prev.filter((id) => id !== server.id));
		}, 3000);
	};

	return (
		<Card className="mb-6">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>{pool.name}</CardTitle>
					<div className="text-sm text-muted-foreground">
						{onlineServers} / {totalServers} servers online
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-center mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowAddForm(!showAddForm)}
					>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Server
					</Button>
				</div>
				{showAddForm && (
					<div className="mb-4">
						<AddServerForm onAddServer={handleAddServer} poolId={pool.id} />
					</div>
				)}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{pool.servers.map((server) => (
						<ServerStatus
							key={server.id}
							server={server}
							isNew={newServers.includes(server.id)}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

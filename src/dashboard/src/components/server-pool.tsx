import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerStatus } from "@/components/server-status";
import type { CreateServer, ServerPool } from "@/types/types";
import { AddServerDialog } from "@/components/add-server-dialog.tsx";

interface ServerPoolProps {
	pool: ServerPool;
	onAddServer: (poolId: ServerPool, server: CreateServer) => void;
}

export function ServerPool({ pool, onAddServer }: ServerPoolProps) {
	const onlineServers = pool.servers.filter(
		(server) => server.status === "healthy",
	).length;
	const totalServers = pool.servers.length;

	const handleAddServer = (server: CreateServer) =>
		onAddServer(pool, server);

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
				<AddServerDialog handleAddServer={handleAddServer} />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{pool.servers.map((server) => (
						<ServerStatus key={server.id} server={server} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

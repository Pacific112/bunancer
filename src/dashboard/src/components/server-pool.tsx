import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerStatus } from "@/components/server-status";
import { AddServerForm } from "@/components/add-server-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { CreateServer, ServerPool } from "@/types/types";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";

interface ServerPoolProps {
	pool: ServerPool;
	onAddServer: (poolId: string, server: CreateServer) => void;
}

export function ServerPool({ pool, onAddServer }: ServerPoolProps) {
	const onlineServers = pool.servers.filter(
		(server) => server.status === "online",
	).length;
	const totalServers = pool.servers.length;

	const handleAddServer = (server: CreateServer) =>
		onAddServer(pool.id, server);

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
				<Dialog>
					<DialogTrigger asChild>
						<div className="flex justify-between items-center mb-4">
							<Button variant="outline" size="sm">
								<PlusCircle className="mr-2 h-4 w-4" />
								Add Server
							</Button>
						</div>
					</DialogTrigger>
					<DialogContent>
						<AddServerForm onAddServer={handleAddServer} />
					</DialogContent>
				</Dialog>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{pool.servers.map((server) => (
						<ServerStatus key={server.id} server={server} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

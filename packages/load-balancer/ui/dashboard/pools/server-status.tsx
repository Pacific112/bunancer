import { Server } from "$/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "$/components/ui/card";
import { Badge } from "$/components/ui/badge";
import { ServerIcon } from "lucide-react";
import { cn } from "$/lib/utils";
import { DeleteServerDialog } from "$/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "$/components/show-logs-dialog.tsx";

interface ServerStatusProps {
	server: Server;
}

export function ServerStatus({ server }: ServerStatusProps) {
	return (
		<Card
			className={cn(
				"transition-all duration-500 ease-in-out",
				server.status === "pending" && "animate-pulse",
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center space-x-2">
					<CardTitle className="text-sm font-medium">{server.name}</CardTitle>
					<Badge
						variant={
							server.status === "healthy"
								? "default"
								: server.status === "unhealthy" || server.status === "dead"
									? "destructive"
									: server.status === "pending"
										? "secondary"
										: "default"
						}
					>
						{server.status}
					</Badge>
				</div>
				<div className="flex">
					{server.status === "healthy" && (
						<DeleteServerDialog server={server} />
					)}
					<ShowLogsDialog server={server} />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center space-x-2 text-sm text-muted-foreground">
					<ServerIcon className="h-4 w-4" />
					<span>{server.ip}</span>
				</div>
				{/*<div className="space-y-2 mt-2">*/}
				{/*	<div className="flex items-center justify-between text-sm">*/}
				{/*		<span>Load</span>*/}
				{/*		<span>{server.load}%</span>*/}
				{/*	</div>*/}
				{/*	<Progress value={server.load} className="h-1" />*/}
				{/*</div>*/}
				{/*<div className="flex items-center justify-between text-sm mt-2">*/}
				{/*	<span className="flex items-center">*/}
				{/*		<Clock className="h-4 w-4 mr-1" />*/}
				{/*		Response Time*/}
				{/*	</span>*/}
				{/*	<span>{server.responseTime} ms</span>*/}
				{/*</div>*/}
			</CardContent>
		</Card>
	);
}

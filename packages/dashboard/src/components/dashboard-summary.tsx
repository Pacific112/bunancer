import { ServerPool } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Server } from "lucide-react";

interface DashboardSummaryProps {
	serverPools: ServerPool[];
}

export function DashboardSummary({ serverPools }: DashboardSummaryProps) {
	const totalServers = serverPools.reduce(
		(acc, pool) => acc + pool.servers.length,
		0,
	);
	const onlineServers = serverPools.reduce(
		(acc, pool) =>
			acc + pool.servers.filter((s) => s.status === "healthy").length,
		0,
	);
	const offlineServers = serverPools.reduce(
		(acc, pool) =>
			acc + pool.servers.filter((s) => s.status === "unhealthy").length,
		0,
	);

	return (
		<div className="grid gap-4 md:grid-cols-3 mb-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Servers</CardTitle>
					<Server className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalServers}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Online Servers</CardTitle>
					<CheckCircle className="h-4 w-4 text-green-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{onlineServers}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Offline Servers</CardTitle>
					<AlertTriangle className="h-4 w-4 text-red-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{offlineServers}</div>
				</CardContent>
			</Card>
			{/*<Card>*/}
			{/*	<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
			{/*		<CardTitle className="text-sm font-medium">*/}
			{/*			Uptime Percentage*/}
			{/*		</CardTitle>*/}
			{/*		<CheckCircle className="h-4 w-4 text-muted-foreground" />*/}
			{/*	</CardHeader>*/}
			{/*	<CardContent>*/}
			{/*		<div className="text-2xl font-bold">*/}
			{/*			{((onlineServers / totalServers) * 100).toFixed(2)}%*/}
			{/*		</div>*/}
			{/*	</CardContent>*/}
			{/*</Card>*/}
		</div>
	);
}

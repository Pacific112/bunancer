import { Server } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ServerIcon, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

interface ServerStatusProps {
	server: Server;
}

export function ServerStatus({ server }: ServerStatusProps) {
	return (
		<Card
			className={cn(
				"transition-all duration-500 ease-in-out",
				server.status === "loading" && "animate-pulse",
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center space-x-2">
					<CardTitle className="text-sm font-medium">{server.name}</CardTitle>
					<Badge
						variant={
							server.status === "online"
								? "default"
								: server.status === "offline"
									? "destructive"
									: server.status === "loading"
										? "secondary"
										: "default"
						}
					>
						{server.status}
					</Badge>
				</div>
				<div className="flex">
					{server.status === "online" && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="ghost" size="icon" title="Stop Server">
									<StopCircle className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Stop {server.name}</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => {
											fetch(`http://localhost:41234/servers/${server.id}`, {
												method: "DELETE",
											});
										}}
									>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon" title="View Logs">
								<FileText className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>{server.name} Logs</DialogTitle>
							</DialogHeader>
							<ScrollArea className="h-[300px] w-full rounded-md border p-4">
								<pre className="text-sm">
									{`[${new Date().toISOString()}] Server ${server.name} started
[${new Date().toISOString()}] Listening on ${server.ip}
[${new Date().toISOString()}] Current load: ${server.load}%
[${new Date().toISOString()}] Average response time: ${server.responseTime}ms`}
								</pre>
							</ScrollArea>
						</DialogContent>
					</Dialog>
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

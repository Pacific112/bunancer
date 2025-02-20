import { Server } from "$/types/types.ts";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "$/components/ui/dialog.tsx";
import { Button } from "$/components/ui/button.tsx";
import { FileText } from "lucide-react";
import { ScrollArea, ScrollBar } from "$/components/ui/scroll-area.tsx";
import { useEffect, useState } from "react";

function LogsArea({ server }: { server: Server }) {
	const [serverLogs, setServerLogs] = useState("");
	useEffect(() => {
		fetch(`http://localhost:41234/servers/${server.id}/logs`)
			.then((r) => r.json())
			.then((r) => r.logs)
			.then(setServerLogs);
	}, []);

	return <>{serverLogs}</>;
}

export const ShowLogsDialog = ({ server }: { server: Server }) => {
	return (
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
				<ScrollArea className="h-[300px] w-full rounded-md border p-4 overscroll-y-auto">
					<pre className="text-sm">
						<LogsArea server={server} />
					</pre>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

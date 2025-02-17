import { cancel, confirm, group, isCancel, select, text } from "@clack/prompts";
import * as crypto from "node:crypto";
import {
	loadRunningServers,
	revalidateProcesses,
	runServer,
	serverLogs,
	stopAllServers,
	stopServer,
} from "./sdk.ts";

let runningServers = await revalidateProcesses(await loadRunningServers());

while (true) {
	console.clear();

	const options = runningServers.map((s) => ({
		value: s.instanceId,
		label: `[${s.pid}] ${s.instanceId}:${s.port}`,
	}));
	const selectedOption = await select({
		message: "Stub Servers",
		options: [
			...options,
			{ value: "add-new", label: "Add New" },
			{ value: "stop-all", label: "Stop All" },
			{ value: "quit", label: "Quit" },
		],
	});

	if (isCancel(selectedOption)) {
		cancel("Bye bye!");
		break;
	}

	if (selectedOption === "add-new") {
		const port = Math.floor(Math.random() * (65535 - 3000) + 3000) + "";
		const instanceId = crypto.randomUUID().slice(0, 13);
		const config = await group({
			instanceId: () =>
				text({
					message: "Instance ID",
					placeholder: instanceId,
					defaultValue: instanceId,
				}),
			port: () =>
				text({
					message: "Port",
					placeholder: port,
					defaultValue: port,
				}),
			detached: () =>
				text({
					message: "Detached mode (y/n)",
					placeholder: "y",
					defaultValue: "y",
				}),
		});

		const pid = await runServer({
			...config,
			detached: config.detached === "y",
		});
		runningServers.push({ instanceId, pid: pid + "", port });
		runningServers = await loadRunningServers();
		continue;
	}

	if (selectedOption === "stop-all") {
		await confirm({ message: "Are you sure?" });
		await stopAllServers(runningServers);
		runningServers = [];
	}
	if (selectedOption === "quit") {
		break;
	}

	console.clear();

	const selectedServer = runningServers.find(
		({ instanceId }) => instanceId === selectedOption,
	);
	if (!selectedServer) {
		continue;
	}
	const option = await select({
		message: `[${selectedServer.pid}] ${selectedServer.instanceId}:${selectedServer.port}`,
		options: [
			{ value: "logs", label: "Logs" },
			{ value: "stop", label: "Stop" },
			{ value: "back", label: "Back" },
		],
	});
	if (option === "logs") {
		console.log(await serverLogs(selectedServer));
		await confirm({ message: "Continue?" });
	}
	if (option === "stop") {
		await stopServer(selectedServer);
		runningServers = runningServers.filter(
			(r) => r.instanceId !== selectedServer.instanceId,
		);
	}
}

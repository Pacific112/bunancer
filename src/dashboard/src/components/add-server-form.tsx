import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateServer } from "@/types/types";

interface AddServerFormProps {
	onAddServer: (server: CreateServer) => void;
}

export function AddServerForm({ onAddServer }: AddServerFormProps) {
	const [serverName, setServerName] = useState(crypto.randomUUID().slice(0, 13));
	const [serverPort, setServerPort] = useState(Math.floor(Math.random() * (65535 - 3000) + 3000) + "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newServer: CreateServer = {
			instanceId: serverName,
			port: serverPort,
		};
		onAddServer(newServer);
		setServerName("");
		setServerPort("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="serverName">Server Name</Label>
				<Input
					id="serverName"
					value={serverName}
					onChange={(e) => setServerName(e.target.value)}
					required
				/>
			</div>
			<div>
				<Label htmlFor="serverPort">Server Port</Label>
				<Input
					id="serverPort"
					value={serverPort}
					onChange={(e) => setServerPort(e.target.value)}
					type="number"
					required
				/>
			</div>
			<Button type="submit">Add Server</Button>
		</form>
	);
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server } from "@/types/types";

interface AddServerFormProps {
	onAddServer: (server: Server) => void;
	poolId: string;
}

export function AddServerForm({ onAddServer, poolId }: AddServerFormProps) {
	const [serverName, setServerName] = useState("");
	const [serverIp, setServerIp] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newServer: Server = {
			id: `${poolId}-${Date.now()}`,
			name: serverName,
			status: "loading",
			ip: serverIp,
			load: 0,
			responseTime: 0,
		};
		onAddServer(newServer);
		setServerName("");
		setServerIp("");
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
				<Label htmlFor="serverIp">Server IP</Label>
				<Input
					id="serverIp"
					value={serverIp}
					onChange={(e) => setServerIp(e.target.value)}
					required
				/>
			</div>
			<Button type="submit">Add Server</Button>
		</form>
	);
}

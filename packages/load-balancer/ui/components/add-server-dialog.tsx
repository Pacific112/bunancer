import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "$/components/ui/dialog.tsx";
import { Button } from "$/components/ui/button.tsx";
import { PlusCircle } from "lucide-react";
import { clsx } from "clsx";
import { Label } from "$/components/ui/label.tsx";
import { Input } from "$/components/ui/input.tsx";
import { useForm } from "react-hook-form";
import { CreateServer } from "api/schema.ts";

interface Props {
	className?: string;
	handleAddServer: (server: CreatełServer) => void;
}

interface AddServerFormProps {
	onAddServer: (server: CreateServer) => void;
}

function AddServerDialogForm({ onAddServer }: AddServerFormProps) {
	const { register, handleSubmit } = useForm<CreateServer>({
		defaultValues: {
			instanceId: crypto.randomUUID().slice(0, 13),
			port: Math.floor(Math.random() * (65535 - 3000) + 3000) + "",
		},
	});

	return (
		<form onSubmit={handleSubmit((e) => onAddServer(e))} className="space-y-4">
			<div>
				<Label htmlFor="instanceId">Server Name</Label>
				<Input {...register("instanceId", { required: true })} />
			</div>
			<div>
				<Label htmlFor="serverPort">Server Port</Label>
				<Input
					id="serverPort"
					{...register("port", {
						required: true,
						min: 3000,
						max: 65535 - 3000,
					})}
					type="number"
				/>
			</div>
			<DialogClose>
				<Button type="submit">Add Server</Button>
			</DialogClose>
		</form>
	);
}

export const AddServerDialog = ({ className, handleAddServer }: Props) => (
	<Dialog>
		<DialogTrigger asChild>
			<div className={clsx("flex justify-between items-center", className)}>
				<Button variant="outline" size="sm">
					<PlusCircle className="mr-2 h-4 w-4" />
					Add Server
				</Button>
			</div>
		</DialogTrigger>
		<DialogContent>
			<AddServerDialogForm onAddServer={handleAddServer} />
		</DialogContent>
	</Dialog>
);

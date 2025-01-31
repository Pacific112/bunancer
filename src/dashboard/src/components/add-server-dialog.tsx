import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PlusCircle } from "lucide-react";
import { AddServerForm } from "@/components/add-server-form.tsx";
import { CreateServer } from "@/types/types.ts";

interface Props {
	handleAddServer: (server: CreateServer) => void;
}

export const AddServerDialog = ({ handleAddServer }: Props) => (
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
);

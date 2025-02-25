import { type ServerPool as ServerPoolType } from "$/types/types.ts";
import { ViewMode } from "$/lib/useViewMode.ts";
import PageLayout from "$/PageLayout.tsx";
import { Dashboard } from "$/dashboard/dashboard.tsx";

function DashboardPage({
	stylesheets = [],
	initialMode,
	initialServerPools,
}: {
	stylesheets: string[];
	initialMode: ViewMode;
	initialServerPools: ServerPoolType[];
}) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<Dashboard
				initialMode={initialMode}
				initialServerPools={initialServerPools}
			/>
		</PageLayout>
	);
}

export default DashboardPage;

import { type ServerPool as ServerPoolType } from "$/types/types.ts";
import { Dashboard } from "$/dashboard/dashboard.tsx";
import { ViewMode } from "$/lib/useViewMode.ts";
import Layout from "$/Layout.tsx";

function App({
	stylesheets = [],
	initialMode,
	initialServerPools,
}: {
	stylesheets: string[];
	initialMode: ViewMode;
	initialServerPools: ServerPoolType[];
}) {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{stylesheets.map((link) => (
					<link rel="stylesheet" key={link} href={link}></link>
				))}
				<title>Bunancer</title>
			</head>
			<body>
				<Layout>
					<Dashboard
						initialMode={initialMode}
						initialServerPools={initialServerPools}
					/>
				</Layout>
			</body>
		</html>
	);
}

export default App;

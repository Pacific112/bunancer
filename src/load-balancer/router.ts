type Params = {
	req: Request;
};
type Handler = (p: Params) => Response;
type GetRoute = {
	method: "GET";
	paths: string[];
	handler: Handler;
};
type RouteDefinition = GetRoute;

type TrieNode = {
	path: string;
	handler?: Handler;
	nodes: Map<string, TrieNode>;
};

type TrieRoot = {
	method: RouteDefinition["method"];
	handler?: Handler;
	nodes: Map<string, TrieNode>;
};

export const get = (path: string, handler: Handler): GetRoute => ({
	method: "GET",
	paths: path.split("/"),
	handler,
});

export const router = (...routes: RouteDefinition[]) => {
	const trie = new Map<RouteDefinition["method"], TrieRoot>();
	for (const route of routes) {
		if (!trie.has(route.method)) {
			trie.set(route.method, { method: route.method, nodes: new Map() });
		}

		let currentNode: { nodes: Map<string, TrieNode>; handler?: Handler } =
			trie.get(route.method)!;
		for (const path of route.paths) {
			if (!currentNode.nodes.has(path)) {
				currentNode.nodes.set(path, { path, nodes: new Map() });
			}
			currentNode = currentNode.nodes.get(path)!;
		}

		if (currentNode.handler) {
			throw new Error("Duplicated route");
		}
		currentNode.handler = route.handler;
	}

	return (req: Request) => {
		const method = req.method as RouteDefinition["method"];
		const path = new URL(req.url).pathname;
		const pathParts = path.split("/");

		let currentNode: TrieRoot | TrieNode | undefined = trie.get(method);
		for (const pathPart of pathParts) {
			if (!currentNode) break;
			currentNode = currentNode.nodes.get(pathPart);
		}

		if (!currentNode) {
			return new Response(undefined, { status: 404 });
		}
		if (!currentNode.handler) {
			return new Response(undefined, { status: 404 });
		}

		return currentNode.handler({ req });
	};
};

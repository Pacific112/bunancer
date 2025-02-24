export const SERVER_NODE_WIDTH = 220;
export const SERVER_NODE_HEIGHT = 100;
export const SERVER_NODE_GAP = 20;
const TOOLBAR_HEIGHT = 35;
const SERVERS_PER_ROW = 3;

export const serverPoolDimensions = (numberOfServers: number) => {
	return {
		width:
			SERVER_NODE_GAP +
			(SERVER_NODE_WIDTH + SERVER_NODE_GAP) *
				Math.min(numberOfServers, SERVERS_PER_ROW),
		height:
			SERVER_NODE_GAP +
			TOOLBAR_HEIGHT +
			(SERVER_NODE_HEIGHT + SERVER_NODE_GAP) *
				Math.max(Math.ceil(numberOfServers / SERVERS_PER_ROW), 1),
	};
};

export const positionForServerNode = (index: number) => ({
	x:
		SERVER_NODE_GAP +
		(SERVER_NODE_WIDTH * (index % SERVERS_PER_ROW) +
			SERVER_NODE_GAP * Math.floor(index % SERVERS_PER_ROW)),
	y:
		SERVER_NODE_GAP +
		TOOLBAR_HEIGHT +
		(SERVER_NODE_HEIGHT + SERVER_NODE_GAP) *
			Math.floor(index / SERVERS_PER_ROW),
});

type RequestHandler = (req: Request) => Response;

export const cors = (handle: RequestHandler): RequestHandler => {
	return (req) => {
		const res = handle(req);
		res.headers.set("Access-Control-Allow-Origin", "*");
		res.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);

		return res;
	};
};

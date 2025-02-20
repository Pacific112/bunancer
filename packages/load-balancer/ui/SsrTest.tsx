import { useState } from "react";

const Comp = ({ c }: { c: number }) => {
	const [count, setCount] = useState(c);
	console.log(count, c);
	return (
		<div>
			ssr 3 {count}
			<button onClick={() => setCount((c) => c + 1)}>Click</button>
		</div>
	);
};

export const SsrTest = ({ c }: { c: number }) => {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href="/styles.css"></link>
				<title>My app</title>
			</head>
			<body>
				<Comp c={c} />
			</body>
		</html>
	);
};

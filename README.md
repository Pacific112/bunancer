# Bunancer

[Demo](https://bunancer.fly.dev/)

This is an exploratory project made by me to better learn what Bun is and what capabilities it has. I wanted to build
something
in less known domain to me and something more interesting then another CRUD app, so I've decided to build very naive
implementation of Load Balancer.

During build I've had few ideas how to make whole thing more interesting and currently load balancer itself is a small
part of a larger project,
visualizing how load balancer works.

As Bunancer was made with learning in mind, I've decided that I don't want to use any framework and most of the
functionalities were built by myself.

**Should I use it on production?**
No, and it's not intended to be used there. This is a project made for fun, experimentation, and learning. While I plan
to use it in my own side projects, I wouldn't recommend deploying it in production environments.

**Note on tests**
As you will go through the source code you will notice that there are no tests. It was concious decision as I was
working on this after hours and I have to made some tradeoffs when it comes to time. I plan to add few tests soon to
check Bun test runner works + I want to have performance tests, but they are not my priority.

# How to start

1. Install Bun - [docs](https://bun.sh/docs/installation)
2. Run `bun install`
3. Run `bun start` - to start load balancer and dashboard
4. Run `bun stub-server` - to open CLI for stub-server management

# Components

Buniter consists of three different parts described below. As this project should be treated as monorepo they can be
found in packages directory.

Currently, load balancer and dashboard share the same package due to few technical decisions described below, but they
will be extracted soon.

## Load Balancer

Responsible for server pool management, health checks, registering new servers in server pool and actual load balancing
using round-robin algorithm.

## SDK & CLI

CLI was created in order to make it easy to me spin up multiple services and test different load balancing scenarios
under various conditions.
It allows to spin up new server, check logs, stop server and change response code. After core logic was extracted as SDK
so Dashboard could reuse it.

## Dashboard

Displays basic statistics about Load Balancer and managed server pools. It also visualizes by using React Flow whole
concept of load balancer.
Underneath it used SDK mentioned above to manage stub servers.

# Technicalities

Below you can find technical description and decisions I've made when building Buniter.

## Load Balancer

[Source Code](packages/load-balancer/src/load-balancer.ts)

As a core component of the project it has multiple responsibilities:

* manages server pool(s)[code](packages/load-balancer/src/pool/server-pool.ts) - currently only single server pool is
  supported, but support for multiple pools with different routing rules will come
* server registry - new servers can register itself and become part of pool. Registry API runs in the same process as
  load balancer, but is exposed on different port.
* round-robin - currently this is the only supported algorithm. It uses simple counter in order to keep track to which
  server next request should be routed
* health checks[code](packages/load-balancer/src/pool/health-check.ts) - health checks are made in fixed interval for
  each registered server in the pool. When health check or one of the requests fails, server is marked as unhealthy and
  temporarily removed from the pool. If after few retries (called with appropriate backoff policy) server is still
  unhealthy, it becomes dead and more checks are made.
* analytics[code](packages/load-balancer/src/pool/server-stats.ts) - every server gathers basic stats for each request
  it received (total requests, RPS, error rate). This is implemented in-memory using naive approximation when
  calculating RPS. Next step will be to move it to external DB, currently I am mostly considering StatsD.

Load Balancer state is persisted so after restart it can rebuild server pool. Currently, it is stored directly on disk,
but I would like to move it to some external db (probably Redis).

## Dashboard

[Source Code](packages/load-balancer/ui/main.tsx)
It consists of Bun server and React App that uses TailwindCSS for styling, shadcn as components library, react-hook-form
for form management and React Flow for visualization.

Interesting part is that application is fully rendered on raw Bun server and hydrated on the client using native React
capabilities. I was not expecting how simple it is to implement basic SSR. More details how it is handled can be
found [SSR](#ssr).

Server for the dashboard heavily relies on in-memory state of load balancer and event communication via event-emitter
and there has to be run in the same process as balancer. I am working on decoupling those things and after this work is
done, Dashboard will be extracted from load-balancer package.

## Router

[Source Code](packages/load-balancer/src/routing/router.ts)

When I've started writing Bun hasn't had [built-in router](https://bun.sh/docs/bundler/fullstack) (it was added in
v1.2.3), so I thought that this is a good opportunity to write my own.

It is simple Trie based router that supports basic CRUD methods. It also supports type-safe path params and body
validation via Zed schemas.

Example usage:

```typescript
router(
	post(
		"/pools/:poolId/servers",
		newServerSchema,
		(body: NewServer, { pathParams: { poolId } }) => new Response()
	)
)
```

More advanced features are built on top of this basic concepts like React Server Side Rendering or public folders.

One of the next steps with the router is to replace shared types between api and frontend with fully inferred ones.

## SSR

[Source Code](packages/load-balancer/src/routing/render-page.tsx)

Server Side Rendering is implemented using only native React API. The main idea is to use `renderReadableStream` on the
server and return it in the response and after that hydrate the same component used on the server on the client using
`hydrateRoot` method in [main](packages/load-balancer/ui/main.tsx) file.
It is allowed for root component to take initial props on the server and it is required to pass same props during
hydration. In order to do this initial props are attached to `globalThis` using `bootstrapStripContent`.

To connect both worlds I am using [pages](packages/load-balancer/ui/pages.ts) registry. It makes possible to make
`renderPage` type-safe (you can use it only with known paths, each path requires concrete props to be provided).

Whole implementation also heavily relies on Bun bundler - it is used to bundle React and Tailwind into single JS and CSS
file and later those files are treated as entry point for the whole SSR. As this bundler is super fast I can
subjectively say that development speed is not hurt. The only downside is that hot reload is not supported in such
approach

Thanks to using SSR I was able to avoid any GET requests and whole website is rendered already containing initial data.

## SSE

[Source Code](packages/load-balancer/src/middlewares/sse.ts)

I always wanted to try Server Sent Events and this was good opportunity. They were much easier to use then I expected,
and currently are used for every data updates.

## SDK

[Source Code](packages/stub-server/sdk.ts)

Currently, SDK supports following operations:

* start new stub server
* display logs
* show all running servers
* kill server

It only supports servers running locally, but it is designed in a way where different destinations can be added (for
example docker images).
In the nearest future I would like to allow to communicate with managed servers via IPC.

Internally it uses [clack](https://github.com/bombshell-dev/clack) for nice (at least I hope so) CLI experience.

## Tests

As I was working on this after hours, I've had to make some tradeoffs and one of them was to skip tests. I plan to add
performance tests, to actually see Bunancer behaves under pressure, but currently nothing is tested.

# What's next

My todo list can be found [here](./.todo) - this is a random list of ideas that I would like to implement. You can also
check [roadmap](https://bunancer.fly.dev/roadmap). 

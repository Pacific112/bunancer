# Bunancer

[Demo](https://bunancer.fly.dev/)

This is an exploratory project I created to better learn what Bun is and what capabilities it has. I wanted to build
something in a domain less familiar to me and more interesting than another CRUD app, so I decided to build a naive
implementation of a Load Balancer.

During development, I had several ideas to make the project more interesting. Currently, the load balancer itself is a
small part of a larger project that visualizes how load balancers work.

As Bunancer was made with learning in mind, I decided not to use any frameworks, and most of the functionality was built
from scratch.

**Should I use it in production?**
No, and it's not intended to be used there. This is a project made for fun, experimentation, and learning. While I plan
to use it in my own side projects, I wouldn't recommend deploying it in production environments.

**Note on tests**
As you go through the source code, you'll notice there are no tests. This was a conscious decision as I was working on
this project after hours and had to make some tradeoffs regarding time. I plan to add a few tests soon to check how
Bun's test runner works and to implement performance tests, but they are not my priority right now.

# How to start

1. Install Bun - [docs](https://bun.sh/docs/installation)
2. Run `bun install`
3. Run `bun start` - to start the load balancer and dashboard
4. Run `bun stub-server` - to open the CLI for stub-server management

# Components

Buniter consists of three different parts described below. As this project should be treated as a monorepo, they can be
found in the packages directory.

Currently, the load balancer and dashboard share the same package due to a few technical decisions described below, but
they will be extracted soon.

## Load Balancer

Responsible for server pool management, health checks, registering new servers in the server pool, and actual load
balancing using a round-robin algorithm.

## SDK & CLI

The CLI was created to make it easy to spin up multiple services and test different load balancing scenarios under
various conditions. It allows you to spin up new servers, check logs, stop servers, and change response codes. The core
logic was extracted as an SDK so the Dashboard could reuse it.

## Dashboard

Displays basic statistics about the Load Balancer and managed server pools. It also visualizes the whole concept of load
balancing using React Flow. Under the hood, it uses the SDK mentioned above to manage stub servers.

# Technicalities

Below you can find technical descriptions and decisions I made when building Buniter.

## Load Balancer

[Source Code](packages/load-balancer/src/load-balancer.ts)

As a core component of the project, it has multiple responsibilities:

* Manages server pool(s) - [code](packages/load-balancer/src/pool/server-pool.ts) - currently only a single server pool
  is supported, but support for multiple pools with different routing rules will come
* Server registry - new servers can register themselves and become part of the pool. The Registry API runs in the same
  process as the load balancer but is exposed on a different port
* Round-robin - currently this is the only supported algorithm. It uses a simple counter to keep track of which server
  should receive the next request
* Health checks - [code](packages/load-balancer/src/pool/health-check.ts) - health checks are made at fixed intervals
  for each registered server in the pool. When a health check or one of the requests fails, the server is marked as
  unhealthy and temporarily removed from the pool. If after a few retries (called with an appropriate backoff policy)
  the server is still unhealthy, it becomes dead and more checks are made
* Analytics - [code](packages/load-balancer/src/pool/server-stats.ts) - every server gathers basic stats for each
  request it receives (total requests, RPS, error rate). This is implemented in-memory using a naive approximation when
  calculating RPS. The next step will be to move it to an external DB; I'm currently considering StatsD

The Load Balancer state is persisted so after restart it can rebuild the server pool. Currently, it is stored directly
on disk, but I would like to move it to an external database (probably Redis).

## Dashboard

[Source Code](packages/load-balancer/ui/main.tsx)

It consists of a Bun server and React App that uses TailwindCSS for styling, shadcn as a components library,
react-hook-form for form management, and React Flow for visualization.

An interesting aspect is that the application is fully rendered on a raw Bun server and hydrated on the client using
native React capabilities. I was surprised by how simple it was to implement basic SSR. More details on how it's handled
can be found in the [SSR](#ssr) section.

The server for the dashboard heavily relies on the in-memory state of the load balancer and event communication via
event-emitter, and therefore must run in the same process as the balancer. I am working on decoupling these components,
and after this work is done, the Dashboard will be extracted from the load-balancer package.

## Router

[Source Code](packages/load-balancer/src/routing/router.ts)

When I started this project, Bun didn't have a [built-in router](https://bun.sh/docs/bundler/fullstack) (it was added in
v1.2.3), so I thought it would be a good opportunity to write my own.

It is a simple Trie-based router that supports basic CRUD methods. It also supports type-safe path params and body
validation via Zod schemas.

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

More advanced features are built on top of these basic concepts, like React Server Side Rendering or public folders.

One of the next steps with the router is to replace shared types between the API and frontend with fully inferred ones.

## SSR

[Source Code](packages/load-balancer/src/routing/render-page.tsx)

Server Side Rendering is implemented using only native React APIs. The main idea is to use `renderReadableStream` on the
server, return it in the response, and then hydrate the same component on the client using the `hydrateRoot` method in
the [main](packages/load-balancer/ui/main.tsx) file.

The root component can accept initial props on the server, and the same props must be passed during hydration. To do
this, initial props are attached to `globalThis` using `bootstrapStripContent`.

To connect both worlds, I use a [pages](packages/load-balancer/ui/pages.ts) registry. This makes it possible to make
`renderPage` type-safe (you can only use it with known paths, and each path requires specific props to be provided).

The implementation also heavily relies on Bun's bundler - it bundles React and Tailwind into single JS and CSS files,
which are then treated as entry points for the entire SSR process. Since the bundler is super fast, development speed is
not noticeably affected. The only downside is that hot reload is not supported with this approach.

Thanks to SSR, I was able to avoid GET requests, as the entire website is rendered already containing the initial data.

## SSE

[Source Code](packages/load-balancer/src/middlewares/sse.ts)

I always wanted to try Server Sent Events, and this was a good opportunity. They were much easier to use than I expected
and are currently used for all data updates.

## SDK

[Source Code](packages/stub-server/sdk.ts)

Currently, the SDK supports the following operations:

* Starting new stub servers
* Displaying logs
* Showing all running servers
* Killing servers

It only supports servers running locally, but it's designed in a way that different destinations can be added (for
example, Docker images). In the near future, I would like to enable communication with managed servers via IPC.

Internally, it uses [clack](https://github.com/bombshell-dev/clack) for a nice CLI experience (at least I hope so).

## Tests

As I was working on this project after hours, I had to make some tradeoffs, one of which was to skip tests. I plan to
add performance tests to see how Bunancer behaves under pressure, but currently nothing is tested.

# What's next

My todo list can be found [here](./.todo) - this is a collection of ideas that I would like to implement. You can also
check the [roadmap](https://bunancer.fly.dev/roadmap). 

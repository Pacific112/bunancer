# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.2 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod

COPY . /temp/prod

RUN bun -v
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
ENV NODE_ENV=production
ENV COOKIE_SECRET=knj32on00s123lmalskdn

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/packages packages
COPY --from=install /temp/prod/package.json package.json
COPY --from=install /temp/prod/config.json config.json

RUN mkdir stubs
RUN mkdir packages/load-balancer/public
RUN touch server-pools-state.json && echo [] > server-pools-state.json
RUN chown -R bun:bun stubs
RUN chown -R bun:bun packages/load-balancer/public
RUN chown bun:bun server-pools-state.json


# run the app
USER bun
EXPOSE 3000/tcp
EXPOSE 41234/tcp
ENTRYPOINT [ "bun", "start" ]
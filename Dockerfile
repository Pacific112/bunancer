# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build

# copy production dependencies and source code into final image
FROM base AS release
ENV NODE_ENV=production
ENV COOKIE_SECRET=knj32on00s123lmalskdn

COPY --from=install /temp/prod/node_modules node_modules
COPY /packages/load-balancer .

# run the app
USER bun
EXPOSE 3000/tcp
EXPOSE 41234/tcp
ENTRYPOINT [ "bun", "start" ]
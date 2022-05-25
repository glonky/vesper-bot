FROM node:lts-alpine as builder
WORKDIR /usr
RUN apk add g++ make py3-pip

COPY ["package.json", "yarn.lock", "tsconfig.json","tsconfig.shared.json", "./"]

COPY packages packages
RUN yarn install --frozen-lockfile
RUN yarn build
# CMD ["ls", "-la", "node_modules"]

## this is stage two , where the app actually runs
FROM node:lts-alpine as app
WORKDIR /usr
RUN apk add g++ make py3-pip

COPY ["package.json", "yarn.lock", "./"]

COPY --from=builder /usr/packages packages
RUN yarn install --frozen-lockfile

CMD ["node", "packages/shared-server/dist/index.js"]
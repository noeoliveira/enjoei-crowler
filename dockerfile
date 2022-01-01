# build
FROM node:16-alpine AS builder
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

#COPY package*.json ./
COPY . ./
RUN apk --no-cache update && apk --no-cache add python3 make g++ && \
    npm i && npm run build && rm -rf /app/node_modules && \
    npm i --only=production && npm prune --production

# release
FROM node:16-alpine
WORKDIR /app

# env vars
ENV CHROME_BIN="/usr/bin/chromium-browser"\
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"\
    NODE_ENV="production"

RUN apk --no-cache update && apk --no-cache add chromium dumb-init 

# copy
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/src


# run
EXPOSE 3000
CMD dumb-init npm run start

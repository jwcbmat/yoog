FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @mini-crm/shared build
RUN pnpm --filter api build

RUN pnpm --filter api --prod deploy /pruned --legacy

FROM node:20-alpine AS production
WORKDIR /usr/src/app

COPY --from=build /pruned/node_modules ./node_modules
COPY --from=build /pruned/dist ./dist
COPY --from=build /pruned/package.json ./package.json

USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]

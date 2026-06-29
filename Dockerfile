# Stage 1: Build
FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_ORIGIN
ARG NEXT_PUBLIC_COMPANY_ADDRESS
ARG NEXT_PUBLIC_COMPANY_PHONE
ARG NEXT_PUBLIC_COMPANY_EMAIL
ARG NEXT_PUBLIC_COMPANY_BUSINESS_HOURS
ARG NEXT_PUBLIC_COMPANY_LATITUDE
ARG NEXT_PUBLIC_COMPANY_LONGITUDE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_ORIGIN=$INTERNAL_API_ORIGIN
ENV NEXT_PUBLIC_COMPANY_ADDRESS=$NEXT_PUBLIC_COMPANY_ADDRESS
ENV NEXT_PUBLIC_COMPANY_PHONE=$NEXT_PUBLIC_COMPANY_PHONE
ENV NEXT_PUBLIC_COMPANY_EMAIL=$NEXT_PUBLIC_COMPANY_EMAIL
ENV NEXT_PUBLIC_COMPANY_BUSINESS_HOURS=$NEXT_PUBLIC_COMPANY_BUSINESS_HOURS
ENV NEXT_PUBLIC_COMPANY_LATITUDE=$NEXT_PUBLIC_COMPANY_LATITUDE
ENV NEXT_PUBLIC_COMPANY_LONGITUDE=$NEXT_PUBLIC_COMPANY_LONGITUDE
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build \
  && test -d /app/public \
  && test -d /app/.next/standalone \
  && test -d /app/.next/static

# Stage 2: Production image
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@swc/helpers ./node_modules/@swc/helpers

USER nextjs

EXPOSE 6601

ENV PORT=6601
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

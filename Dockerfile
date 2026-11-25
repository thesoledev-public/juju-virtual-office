FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY site/ ./site/
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4381
EXPOSE 4381
CMD ["node", "server.mjs"]

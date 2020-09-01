# Build image
FROM node:12 AS build
WORKDIR /usr/repos/simplon_metromobility
COPY . /usr/repos/simplon_metromobility
RUN npm ci && npm run build

# Host image
FROM nginx AS host
WORKDIR /usr/app/simplon_metromobility
COPY --from=build /usr/repos/simplon_metromobility/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
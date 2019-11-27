FROM timbru31/node-alpine-git as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/

ARG CONFIG=production
ENV CONFIG=${CONFIG}

ARG BASE_HREF=/
ENV BASE_HREF=${BASE_HREF}

RUN npm install -g @angular/cli
RUN ng build --configuration=$CONFIG --base-href=$BASE_HREF

FROM nginx:stable-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html


RUN echo "server { listen 8099; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html =404; } }" >> /etc/nginx/conf.d/default.conf

EXPOSE 8099

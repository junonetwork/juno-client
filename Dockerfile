# see also: https://github.com/jwilder/nginx-proxy
FROM nginx:alpine

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# TODO - build app to ensure dist is up to date 

COPY dist/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

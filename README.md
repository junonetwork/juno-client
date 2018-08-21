## Airplane Glue

A Graphical IDE for Knowledge Graphs

### Installation
```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run validate && npm run build
```

### Dockerize
```bash
# build
npm run validate && \
  npm run build && \
  docker build -t airplane-glue:latest .

# run
docker rm -f airplane-glue
docker run --name airplane-glue -p 80:80 -d airplane-glue

# login
docker exec -it airplane-glue sh

# inspect
docker inspect airplane-glue
```

### Deploy
```bash
# build docker images for airplane-glue and middlepacco

# run docker compose
docker-compose up -d
```

## License
[ISC](https://opensource.org/licenses/ISC)

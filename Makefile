COMPOSE_FILE=docker-compose.dev.yaml
CONTAINER_NAME=server
IMAGE_NAME=livy-server-dev

up:
	docker-compose -f $(COMPOSE_FILE) up -d --build

down:
	docker-compose -f $(COMPOSE_FILE) down

install:
	docker build -t $(IMAGE_NAME) -f $(PWD)/docker/Dev.Dockerfile .
	docker run -it --rm -v $(PWD):/app -w /app $(IMAGE_NAME) npm install

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

cli:
	docker-compose -f $(COMPOSE_FILE) exec $(CONTAINER_NAME) /bin/bash
.PHONY: docker-dev-start
docker-dev-start:
	docker compose -p simbora -f docker/dev/docker-compose.yaml up -d

.PHONY: docker-dev-stop
docker-dev-stop:
	docker compose -p simbora -f docker/dev/docker-compose.yaml down
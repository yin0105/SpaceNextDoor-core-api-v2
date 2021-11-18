DIR := ${CURDIR}


PURPLE 		:= $(shell tput setaf 129)
GRAY  		:= $(shell tput setaf 245)
GREEN  		:= $(shell tput setaf 34)
BLUE 		:= $(shell tput setaf 25)
YELLOW 		:= $(shell tput setaf 3)
WHITE  		:= $(shell tput setaf 7)
RESET  		:= $(shell tput sgr0)

.PHONY: help h
.DEFAULT_GOAL := help

help:

	@echo Development Environment Management Targets:
	@echo
	@awk '/^[a-zA-Z\/\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-10s${RESET} ${GRAY}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo
	@echo Specific Targets:
	@echo
	@awk '/^[a-zA-Z\/\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^### (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-30s${RESET} ${GRAY}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set (make $*=.. target or export $*=.."; \
		exit 1; \
	fi

## First time local environment setup.
setup: node/clean node/install stack/network/create stack/buildrestart

## start your day
work: stack/module/up

## end your day
leave: stack/module/down

install/dep: guard-d
	@$(MAKE) node/install/dep d=$(d)

## Install a specific dependecy NPM package
node/install/dep: guard-d

	@docker-compose exec next-door-core-api npm install $(d) --save
	@cd $(DIR) && npm install $(d) --save

## Install all node_modules for the module.
node/install:

	@cd $(DIR) && npm install

## Remove node_modules, package-lock.json yarn.lock for the module.
node/purge:

	@cd $(DIR) && rm -rf node_modules package-lock.json yarn.lock

## Remove node_modules for the module.
node/clean:

	@echo "Deleting node_modules..."
	@cd $(DIR) && rm -rf node_modules

docker/remove/next-door-images:
	@docker rmi $(docker images |grep 'next-door')

# Access to a specific docker container
docker/exec: guard-c guard-m
	@docker-compose exec $(c) $(m)

### Creates the docker network (checks if it exists first).
stack/network/create:

	@docker network inspect next_door_network > /dev/null || docker network create --ipam-driver default --attachable next_door_network

### Displays the output of docker.
stack/status:

	@echo "${BLUE}########################################################################################################################${RESET}"
	@echo "${GREEN}CURRENT CONTAINER STATUS:${RESET}"
	@echo "----"
	@docker ps -a --format '{{.Names}};{{.Status}};{{.Ports}}' | grep next-door | column -s";" -t
	@echo "----"
	@echo "TOTAL: ${GREEN}$(shell docker ps -a | grep next-door | wc -l)${RESET}"
	@echo "${BLUE}########################################################################################################################${RESET}"

### Bring the module UP + REBUILD.
stack/buildrestart:

	@echo "Brining module restart..."
	@cd $(DIR) && [ -f docker-compose.yaml ] && docker-compose up -d --build;

	@$(MAKE) stack/status
	@osascript -e 'display notification "complete" with title "stack/buildrestart" sound name "default"'

### Bring the module DOWN.
stack/module/down:

	@echo "Bringing module down..."
	@cd $(DIR) && [ -f docker-compose.yaml ] && docker-compose down

### Bring the module UP
stack/module/up:

	@echo "Spinning up module..."
	@cd $(DIR) && [ -f docker-compose.yaml ] && docker-compose up -d


# Project paths

FRONT_PATH = /home/chris/Dev/projects/focusboard/focusboard-front
API_PATH = /home/chris/Dev/projects/focusboard/focusboard-api
ADMINER_PATH = /home/chris/Dev/tools/adminer

.PHONY: start stop

default: help

help:
	@echo "================================================================="
	@echo "    Focusboard Development Stack - Available Commands"
	@echo "================================================================="
	@echo "  make start   : Start API, Adminer, and React Frontend"
	@echo "  make stop    : Stop Docker containers and Adminer server"
	@echo "  make debug   : Show logs from Symfony API Docker containers"
	@echo "  make help    : Show this help message"
	@echo "================================================================="

start:
	@echo "--> Starting API (Docker)..."
	cd $(API_PATH) && docker compose --env-file .env --env-file .env.local up -d --force-recreate

	@echo "--> Starting Adminer (PHP server) in background..."
	php -S localhost:8080 -t $(ADMINER_PATH) > /dev/null 2>&1 &

	@echo "--> Development Stack started successfully!"
	@echo ""
	@echo "    🔗 Symfony API : https://localhost/api"
	@echo "    🔗 Adminer     : http://localhost:8080"
	@echo "    🔗 React App   : http://localhost:5173/"
	@echo ""
	@echo "--> Launching React development server (Press Ctrl+C to stop)..."
	@echo ""
	cd $(FRONT_PATH) && npm run dev

stop:
	@echo "--> Stopping API (Docker)..."
	cd $(API_PATH) && docker compose down

	@echo "--> Stopping Adminer..."
	-pkill -f "php -S localhost:8080"
	@echo "--> Development Stack stopped."
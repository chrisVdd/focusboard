# Project paths

FRONT_PATH = /home/chris/Dev/projects/focusboard/focusboard-front
API_PATH = /home/chris/Dev/projects/focusboard/focusboard-api
ADMINER_PATH = /home/chris/Dev/tools/adminer

.PHONY: start stop

start:
	@echo "--> Starting API (Docker)..."
	cd $(API_PATH) && docker compose up -d

	@echo "--> Starting Adminer (PHP server) in background..."
	php -S localhost:8080 -t $(ADMINER_PATH) > /dev/null 2>&1 &

	@echo "--> Starting React development server..."
	cd $(FRONT_PATH) && npm run dev

stop:
	@echo "--> Stopping API (Docker)..."
	cd $(API_PATH) && docker compose down

	@echo "--> Stopping Adminer..."
	-pkill -f "php -S localhost:8080"
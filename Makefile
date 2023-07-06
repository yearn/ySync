.PHONY: build up down

build:
	docker build -t your-app .

up:
	docker run -d -p 3005:3005 --name your-app-instance your-app

down:
	docker stop your-app-instance && docker rm your-app-instance

.PHONY: build up down

build:
	docker build -t ysync .

up:
	docker run -d -p 3005:3005 --name ysync ysync

down:
	docker stop ysync && docker rm ysync

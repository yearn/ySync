.PHONY: build up down

build:
	docker build -t ysync .

up:
	docker run -d -p 3005:3005 --name ysync ysync

deploy:
	git pull --rebase && make down && make up

down:
	docker stop ysync && docker rm ysync

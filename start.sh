#!/bin/sh
echo shut down existed docker service
echo you env is $1
docker stop nestjs

docker container rm nestjs

docker rmi neofura-authservice_nestjs -f
docker-compose up -d




#!/bin/sh
echo shut down existed docker service
echo you env is $1
docker stop  neofura-authservice-nestjs-1

docker container rm  neofura-authservice-nestjs-1

docker rmi neofura-authservice_nestjs -f
docker-compose up -d




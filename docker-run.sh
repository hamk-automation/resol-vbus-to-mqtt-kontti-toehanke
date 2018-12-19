docker stop humia-integration-konttiserver
docker rm humia-integration-konttiserver
docker run -dit --name humia-integration-konttiserver --restart unless-stopped -v "$PWD"/conf:/usr/src/app/conf humia-integration-konttiserver:latest

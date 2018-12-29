docker stop ${PWD##*/}
docker rm ${PWD##*/}
docker run -dit --name ${PWD##*/} --restart unless-stopped -v "$PWD"/conf:/usr/app/conf ${PWD##*/}:latest

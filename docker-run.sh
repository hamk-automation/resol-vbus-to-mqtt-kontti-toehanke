docker stop ${PWD##*/}
docker rm ${PWD##*/}
docker run -dit --name ${PWD##*/} --group-add dialout --device=/dev/ttyACM0 -v "$PWD"/conf:/usr/app/conf ${PWD##*/}:0.1

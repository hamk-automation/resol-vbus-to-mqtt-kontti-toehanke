docker stop telegraf_"${PWD##*/}"
docker rm telegraf_"${PWD##*/}"
docker run -dit --restart unless-stopped --name telegraf_"${PWD##*/}" -v "$PWD"/conf/telegraf.conf:/etc/telegraf/telegraf.conf:ro telegraf
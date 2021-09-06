#!/bin/bash

## install sudo via apt
## add "mongodb ALL=(root) NOPASSWD: /usr/bin/sh" to /etc/sudoers
##copy this file to /usr/local/bin/front.sh



ip=$(grep apiIP '/home/winingsfrontend/src/components/config.json' |  sed --expression='s/"//g' | sed --expression='s/apiIP://g' | sed --expression='s/,//g')
port=$(grep apiPort '/home/winingsfrontend/src/components/config.json' | sed --expression='s/"//g' | sed --expression='s/apiPort://g')
changed=false

echo ip read from config is:"${ip}":
echo port read from config is:"${port}":


sed "s/'${ip}'/'${BACKEND_IP}'/g" /home/winingsfrontend/src/components/config.json

sed 's/${port}/'${BACKEND_PORT}'/g' /home/winingsfrontend/src/components/config.jso

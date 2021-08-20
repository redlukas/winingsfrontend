#!/bin/bash

## install sudo via apt
## add "mongodb ALL=(root) NOPASSWD: /usr/bin/sh" to /etc/sudoers
##copy this file to /usr/local/bin/front.sh


sleep 6

grep apiIP

ip=$(grep apiIP '/home/winingsfrontend/src/components/config.json' | sed --expression='s/"apiIP" : "//g' | sed --expression='s/",//g')
port=$(grep apiPort '/home/winingsfrontend/src/components/config.json' | sed --expression='s/"apiPort" : "//g' | sed --expression='s/"//g')
changed=false


##check if the IP variable is set, compare it to the one in the file and change if necessairy
if [[ -z "${BACKEND_IP}" ]]; then
  echo BACKEND_IP is undefined
else
  if grep -q '"apiIP": "'${BACKEND_IP}'",' "/home/winingsfrontend/src/components/config.json"; then
      echo IP is already overwritten
    else
    echo setting the IP to "${BACKEND_IP}"
    sudo -u root -H sh -c "sed -i s/${ip}/${BACKEND_IP}/g /home/winingsfrontend/src/components/config.json"
    "$changed"=true
    echo config file overwritten, it is now:
    cat /home/winingsfrontend/src/components/config.json
  fi
fi


##check if the Port variable is set, compare it to the one in the file and change if necessairy
if [[ -z "${BACKEND_PORT}" ]]; then
  echo BACKEND_PORT is undefined
  if [ "$port" = 8888 ] ; then
    echo Port in build already set to 8888, doing nothing
  else
    echo defaulting to port 8888
    sudo -u root -H sh -c "sed -i s/${port}/8888/g /home/winingsfrontend/src/components/config.json"
    "$changed"=true
    echo config file overwritten, it is now:
    cat /home/winingsfrontend/src/components/config.json
  fi
else
  if grep -q '"apiPort": "'${BACKEND_PORT}'"' "/home/winingsfrontend/src/components/config.json"; then
      echo Port is already overwritten
    else
    echo setting the IP to "${BACKEND_PORT}"
    sudo -u root -H sh -c "sed -i s/${port}/${BACKEND_PORT}/g /home/winingsfrontend/src/components/config.json"
    "$changed"=true
    echo config file overwritten, it is now:
    cat /home/winingsfrontend/src/components/config.json
  fi
fi


##if we have made changes to the config file, we must rebuild the prod build
if [ "$changed" = true ] ; then
  cd /home/winingsfrontend
  echo re-building the production build of the frontend
  sudo -u root -H sh -c "npm run build"
  echo build completed
fi

echo starting frontend server
serve -s /home/winingsfrontend/build

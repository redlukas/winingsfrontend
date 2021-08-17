#!/bin/bash

sleep 6

if [[ -z "${BACKEND_IP}" ]]; then
  echo IP is undefinied
else
  if grep -q ipgoeshere "/home/winingsfrontend/src/components/config.json"; then
    echo setting the IP to "${BACKEND_IP}"
    sed -i s/ipgoeshere/"${IP}"/g /home/winingsfrontend/src/components/config.json
    echo config file overwritten, it is now:
    cat /home/winingsfrontend/src/components/config.json
    cd /home/winingsfrontend
    echo re-building the production build of the frontend
    sudo -u root -H sh -c "npm run build"
    echo build completed
    else
    echo IP is already overwritten
    fi
fi

echo starting frontend server
serve -s /home/winingsfrontend/build

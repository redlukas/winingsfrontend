#!/bin/bash

BACKEND_IP_READ="$(ifconfig | grep -A 1 'wlan0' | grep 'inet' | tr ' ' :| cut -f 10 -d':')"

echo i read the backend ip as
echo "$BACKEND_IP_READ"
##this script should be run in a 32bit raspbian install on startup
##it assumes the rasPiEnvironmentSetup has already run

CHANGED=false
##check and register the environment variables
if [[ -z "${BACKEND_IP}" ]];then
  export BACKEND_IP=$BACKEND_IP_READ
  CHANGED=true
  echo initial backend IP set
else
  if [[ "${BACKEND_IP}" != "$BACKEND_IP_READ" ]];then
    export BACKEND_IP=$BACKEND_IP_READ
    CHANGED=TRUE
    echo IP has changed
  else
    echo IP has not changed
  fi
fi

##if necessairy, rebuild the frontend prod build
if [ "$CHANGED" == true ] ; then
  cd /home/pi/winingsfrontend || exit
  echo re-building the production build of the frontend
  npm run build
  echo build completed
fi

##start the servers
echo resurrecting the services
pm2 resurrect

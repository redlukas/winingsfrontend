#!/bin/bash

BACKEND_IP_READ="$(ifconfig | grep -A 1 'wlan0' | grep 'inet' | tr ' ' :| cut -f 10 -d':')"

echo i read the backend ip as
echo "$BACKEND_IP_READ"
ip=$(grep apiIP '/home/pi/winingsfrontend/src/components/config.json' |  sed --expression='s/"//g' | sed --expression='s/apiIP: //g' | sed --expression='s/,//g')
echo the frontend IP is set to
echo "$ip"
##this script should be run in a 32bit raspbian install on startup
##it assumes the rasPiEnvironmentSetup has already run


##check and register the IP
if [[ "$ip" != "$BACKEND_IP_READ" ]];then
  echo stopping frontend
  pm2 stop poker-frontend
  sudo -u root -H sh -c "sed -i 's/${ip}/${BACKEND_IP_READ}/g' /home/pi/winingsfrontend/src/components/config.json"
  cd /home/pi/winingsfrontend || exit
  echo re-building the production build of the frontend
  sudo -u root -H sh -c "npm run build"
  echo build completed
  pm2 start poker-frontend
else
  echo IP has not changed
fi


##start the servers
echo resurrecting the services
pm2 resurrect

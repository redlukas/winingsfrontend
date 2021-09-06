#!/bin/bash

##use this script on a fresh 32 bit raspbian install
## must be run as superuser

##install deps trough apt
apt update
apt upgrade -y
apt install git nano nodejs npm mongodb -y

## register and start mongodb
systemctl enable mongodb
systemctl start mongodb

##set the backend port env variable
export BACKEND_PORT=8888

##pull the repos
cd /home/pi/ || exit
git clone https://github.com/redlukas/winingsfrontend.git
git clone https://github.com/redlukas/winningscalculator.git

##install the npm deps
npm i -g pm2
cd winningscalculator || exit
npm i
cd ../winingsfrontend || exit
npm i

##make the scripts executable
chmod +x /home/pi/winingsfrontend/shellScripts/resetconfigfile.sh
chmod +x /home/pi/winingsfrontend/shellScripts/gitpull.sh
chmod +x /home/pi/winingsfrontend/shellScripts/barebonaPi/rasPiStartup.sh

##run the startup script to set the Env variables
/bin/bash /home/pi/winingsfrontend/shellScripts/barebonePi/rasPiStartup.sh

##register the startup script with cron
crontab -l > crontemp
echo "@reboot /bin/bash /home/pi/winingsfrontend/shellScripts/barebonePi/rasPiStartup.sh" >> crontemp
crontab crontemp
rm crontemp


pm2 start /home/pi/winningscalculator/model.js --name poker-backend
pm2 serve /home/pi/winingsfrontend/build 5000 --name poker-frontend
pm2 save



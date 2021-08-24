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


##pull the repos
cd /home/pi/
git clone https://github.com/redlukas/winingsfrontend.git
git clone https://github.com/redlukas/winningscalculator.git

##install the npm deps
cd winningscalculator
npm i
cd ../winingsfrontend
npm i

##make the scripts executable
chmod +x /home/pi/winningscalculator/back.sh
chmod +x /home/pi/winingsfrontend/shellScripts/front.sh
chmod +x /home/pi/winingsfrontend/shellScripts/resetconfigfile.sh
chmod +x /home/pi/winingsfrontend/shellScripts/gitpull.sh

##register the startup script with cron
crontab -l > crontemp
echo "@reboot /bin/bash /home/pi/winningscalculator/back.sh" >> crontemp
echo "@reboot /bin/bash /home/pi/winingsfrontend/shellScripts/front.sh" >> crontemp
crontab crontemp
rm crontemp



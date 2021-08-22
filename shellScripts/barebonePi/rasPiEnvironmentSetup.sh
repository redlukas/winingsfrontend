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
git pull https://github.com/redlukas/winingsfrontend.git
git pull https://github.com/redlukas/winningscalculator.git

##install the npm deps
cd winningscalculator
npm i
cd ../winingsfrontend
npm i

##make the scripts executable

##register the startup script with cron




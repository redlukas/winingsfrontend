#!/bin/bash

cd /home/winingsfrontend
git reset --hard
git pull
cd /home/winningscalculator
git reset --hard
git pull


chmod +x /home/winningscalculator/back.sh
chmod +x /home/winingsfrontend/shellScripts/front.sh
chmod +x /home/winingsfrontend/shellScripts/resetconfigfile.sh

##install the NPM dependencies of the projects
cd /home/winingsfrontend
npm install
cd /home/winningscalculator
npm install

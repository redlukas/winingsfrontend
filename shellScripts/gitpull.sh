#!/bin/bash

cd /home/winingsfrontend
git reset --hard
git pull
cd /home/winningscalculator
git reset --hard
git pull


chmod +x /home/winningscalculator/back.sh
chmod -R +x /home/winingsfrontend/shellScripts/

##install the NPM dependencies of the projects
cd /home/winingsfrontend
npm install
cd /home/winningscalculator
npm install

#!/bin/bash

##helper script to facilitate pulling the frontend and packend repos and installing the npm deps

cd ~/winingsfrontend || exit
git reset --hard
git pull
cd ~/winningscalculator || exit
git reset --hard
git pull


chmod +x ~/winningscalculator/back.sh
chmod -R +x ~/winingsfrontend/shellScripts/

##install the NPM dependencies of the projects
cd ~/winingsfrontend || exit
npm install
cd ~/winningscalculator || exit
npm install

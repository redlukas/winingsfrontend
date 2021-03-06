#!/bin/bash

##This script helps you set up the whole environment if you you are starting with a fresh mongo docker image
##this script assumes you have freshly updated your apt repos, installed git and pulled the frontend and backend server repos into /home/

##install dependencies trough apt
apt install sudo nano nodejs npm git -y
if grep -q mongodb "/etc/sudoers"
then
  echo mongodb is already registered in sudoers file
else
  echo mongodb ALL=\(root\) NOPASSWD: /usr/bin/sh >> /etc/sudoers
fi

##register the shell scripts in docker entrypoint
if grep -q winningscalculator "/usr/local/bin/docker-entrypoint.sh"
then
  echo shell skripts already linked in entrypoint script
else
  touch /usr/local/bin/docker-entrypoint.sh.temp
  head -n -2 /usr/local/bin/docker-entrypoint.sh | cat > /usr/local/bin/docker-entrypoint.sh.temp
  cp /usr/local/bin/docker-entrypoint.sh.temp /usr/local/bin/docker-entrypoint.sh
  echo "exec /bin/bash /home/winningscalculator/back.sh &" >> /usr/local/bin/docker-entrypoint.sh
  echo "exec /bin/bash /home/winingsfrontend/shellScripts/front.sh &" >> /usr/local/bin/docker-entrypoint.sh
  printf "\n" >> /usr/local/bin/docker-entrypoint.sh
  echo 'exec "$@"' >> /usr/local/bin/docker-entrypoint.sh
fi


##copy the reset script to the appropriate location
cp /home/winingsfrontend/shellScripts/resetconfigfile.sh ~/resetconfigfile.sh

##make the scripts executable
chmod +x ~/resetconfigfile.sh
chmod +x /home/winningscalculator/back.sh
chmod +x /home/winingsfrontend/shellScripts/front.sh
chmod +x /home/winingsfrontend/shellScripts/resetconfigfile.sh
chmod +x /home/winingsfrontend/shellScripts/gitpull.sh

##install the NPM dependencies of the projects
cd /home/winingsfrontend
npm install
cd /home/winningscalculator
npm install
npm i -g serve

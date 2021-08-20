#!/bin/bash

##install sudo
/bin/bash apt install sudo nano -y
if grep -q winninsgcalculator "/usr/local/bin/docker-entrypoint.sh"
then
  echo mongodb is already registered in ssudoers file
else
  echo mongodb ALL=\(root\) NOPASSWD: /usr/bin/sh >> /etc/sudoers
fi

##register the shell scripts in docker entrypoint
if grep -q winninsgcalculator "/usr/local/bin/docker-entrypoint.sh"
then
  echo shell skripts already linked in entrypoint script
else
  sed -i s/exec \"\$@\"/exec /bin/bash /home/winningscalculator/back.sh & \rn exec /bin/bash /home/shellScripts/winingsfrontend/front.sh & \rn  exec \"\$@\"/g /usr/local/bin/docker-entrypoint.sh
fi

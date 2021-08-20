#!/bin/bash

##install sudo
/bin/bash apt install sudo nano -y
if grep -q mongodb "/etc/sudoers"
then
  echo mongodb is already registered in sudoers file
else
  echo mongodb ALL=\(root\) NOPASSWD: /usr/bin/sh >> /etc/sudoers
fi

##register the shell scripts in docker entrypoint
if grep -q winninsgcalculator "/usr/local/bin/docker-entrypoint.sh"
then
  echo shell skripts already linked in entrypoint script
else
  sed -i s/exec \"\$@\"/exec /bin/bash /home/winningscalculator/shellScripts/back.sh & \rn exec /bin/bash /home/winingsfrontend/shellScripts/front.sh & \rn  exec \"\$@\"/g /usr/local/bin/docker-entrypoint.sh
fi


##copy the reset script to the appropriate location
cp /home/winingsfrontend/shellScripts/resetconfigfile.sh ~/resetconfigfile.sh

##make the scripts executable
chmod +x ~/resetconfigfile.sh
chmod +x /home/winningscalculator/shellScripts/back.sh
chmod +x /home/winingsfrontend/shellScripts/front.sh

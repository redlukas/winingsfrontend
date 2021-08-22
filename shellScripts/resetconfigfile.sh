#!/bin/bash

##when you want to start with a canonized config file, run this script


echo '{' > /home/winingsfrontend/src/components/config.json
echo \"apiIP\" : \"ipgoeshere\", >> /home/winingsfrontend/src/components/config.json
echo \"apiPort\" : \"portgoeshere\" >> /home/winingsfrontend/src/components/config.json
echo '}'  >> /home/winingsfrontend/src/components/config.json

#!/bin/bash

source <(dotenv-export envs/.env | sed 's/\\n/\n/g')
#yarn run docs:update
#printenv
#echo "$SWAGGER_UI_PORT" 
http-server docs/dist/ -p $SWAGGER_UI_PORT

#!/bin/bash
set -e
green=`tput setaf 2`
reset=`tput sgr0`

NAME=juno/client
VERSION=0.0.1
TAG=$VERSION-$(git log -1 --format=\%h)
IMG=$NAME:$TAG
LATEST=$NAME:latest

# Test
echo -e "\n${green}npm run validate${reset}\n"
npm run validate

# Build and Tag
echo -e "\n${green}npm run build${reset}\n"
npm run build
echo -e "\n${green}docker build -t $IMG . ${reset}\n"
docker build -t $IMG .
echo -e "\n${green}docker tag $IMG $LATEST ${reset}\n"
docker tag $IMG $LATEST

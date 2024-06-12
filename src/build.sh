#!/bin/bash

rm -rf dist

# COMPILE TS FILES
tsc

# EDIT AND COPY package.json
BUNDLE_VERSION=$( cat package.json | jq -r '.version' )
SVGO_VERSION=$( cat package.json | jq -r '.dependencies.svgo' )
cp ./src/package.json ./dist/temp.json
jq -r --arg version "$BUNDLE_VERSION" '.version |= $version' ./dist/temp.json > ./dist/temp_.json
jq -r --arg version "$SVGO_VERSION" '.dependencies.svgo |= $version' ./dist/temp_.json > ./dist/package.json
echo ""
echo ""
echo "###############################################################################################"
echo "###### Main bundle version: $BUNDLE_VERSION"
echo "######   · svgo version: $SVGO_VERSION"
echo "###############################################################################################"
echo ""
echo ""
rm -rf ./dist/temp.json

# COPY OTHER FILES
cp ./README.md ./dist
cp ./LICENSE ./dist
cp ./.npmrc ./dist

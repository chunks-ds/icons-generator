#!/bin/bash
WORK_DIR="./tmp"
MODE=""
MODE_VALUE=""
if [ "$1" = "--mode" ]; then
  MODE=$1
  MODE_VALUE=$2
fi
echo $1
if [[ "$1" == --mode=* ]]; then
  MODE=$1
fi

rm -rf "$WORK_DIR"

# COMPILE TS FILES
tsc

# EDIT AND COPY package.json
BUNDLE_VERSION=$( cat package.json | jq -r '.version' )
SVGO_VERSION=$( cat package.json | jq -r '.dependencies.svgo' )
cp ./src/package.json $WORK_DIR/temp.json
jq -r --arg version "$BUNDLE_VERSION" '.version |= $version' $WORK_DIR/temp.json > $WORK_DIR/temp_.json
jq -r --arg version "$SVGO_VERSION" '.dependencies.svgo |= $version' $WORK_DIR/temp_.json > $WORK_DIR/package.json
echo ""
echo ""
echo "###############################################################################################"
echo "###### Main bundle version: $BUNDLE_VERSION"
echo "######   · svgo version: $SVGO_VERSION"
echo "###############################################################################################"
echo ""
echo ""
rm -rf $WORK_DIR/temp.json
rm -rf $WORK_DIR/temp_.json

# COPY OTHER FILES
cp ./README.md $WORK_DIR
cp ./LICENSE $WORK_DIR
cp ./.npmrc $WORK_DIR

node $WORK_DIR/index.js "$MODE" "$MODE_VALUE"

#!/bin/sh
BRANCH=$(echo ${GITHUB_REF##*/})
TARGET="benchmark"

echo $BRANCH

if [ $BRANCH = $TARGET ]; then
    yarn
    yarn test
fi

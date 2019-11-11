#!/bin/sh
BRANCH=$(echo ${GITHUB_HEAD_REF##*/})
TARGET="feature/benchmark"

echo $BRANCH

if [ $BRANCH = $TARGET ]; then
    yarn
    yarn start
fi

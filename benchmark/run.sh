#!/bin/sh
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET="feature/benchmark"

echo $BRANCH

if [ $BRANCH = $TARGET ]; then
    yarn start
fi

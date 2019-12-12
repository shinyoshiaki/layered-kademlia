#!/bin/sh
BRANCH=$(echo ${GITHUB_REF##*/})
TARGET="benchmark"

echo $BRANCH

if [ $BRANCH = $TARGET ]; then
    ./benchmark.sh
fi

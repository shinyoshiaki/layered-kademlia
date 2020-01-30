#!/bin/sh
yarn ts-node ./worker/layered.bench.ts
yarn ts-node ./worker/kad.bench.ts

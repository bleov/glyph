#!/bin/bash

set -e

bun install --frozen-lockfile
bunx --bun vite build
rm -rfv ./pb_public
mkdir ./pb_public
cp -r ./dist/* ./pb_public/

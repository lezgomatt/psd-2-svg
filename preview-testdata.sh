#!/usr/bin/env bash

mkdir -p previews

for psd in testdata/*.psd
do
    echo "$psd..."
    ./psd2svg.js "$psd" > "previews/$(basename "$psd" .psd).svg"
done

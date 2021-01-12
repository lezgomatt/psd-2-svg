#!/usr/bin/env node

const fs = require('fs');
const { convertFile } = require('.');

const usage = 'Usage: psd-2-svg <psd-file> <svg-output>';

if (process.argv.length !== 4) {
    return console.error(usage);
}

let psdPath = process.argv[2];
if (!fs.existsSync(psdPath)) {
    return console.error('File not found: ' + psdPath);
}

let svgPath = process.argv[3];
if (fs.existsSync(svgPath)) {
    return console.error('File already exists: ' + svgPath);
}

let output = convertFile(psdPath).toString();
fs.writeFileSync(svgPath, output);

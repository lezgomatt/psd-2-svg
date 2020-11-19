#!/usr/bin/env node

const { convertFile } = require(".");

console.log(convertFile(process.argv[2]).toString());

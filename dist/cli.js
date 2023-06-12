#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/cli.js
const index_1 = __importDefault(require("./index"));
const [, , ...args] = process.argv;
const inputDir = args[0] || './assets/fonts/svg';
const outputDir = args[1] || './assets/fonts';
const fontName = args[2] || 'custom-icons';
(0, index_1.default)(inputDir, outputDir, fontName)
    .catch((error) => {
    console.error('Failed to execute fontello-local build command:', error);
});

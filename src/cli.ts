#!/usr/bin/env node

// src/cli.js
import generateFont from './index'
const [,, ...args] = process.argv

const inputDir = args[0] || './assets/fonts/svg'
const outputDir = args[1] || './assets/fonts'
const fontName = args[2] || 'custom-icons'

generateFont(inputDir, outputDir, fontName)
  .catch((error) => {
    console.error('Failed to execute fontello-local build command:', error)
  })

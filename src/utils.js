// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

import { options } from './plugins.js'
import chalk from 'chalk'
import { execFileSync } from 'child_process'
import fs from 'fs'
import gifsicle from 'gifsicle'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

const compression = async (filename, dry) => {
  const filenameBackup = `${filename}.bak`
  fs.copyFileSync(filename, filenameBackup)

  const fileSizeBefore = size(filename)

  if (fileSizeBefore === 0) {
    console.info(chalk.blue(`Skipping ${filename}, it has ${sizeReadable(fileSizeBefore)}`))
    return
  }

  const tempFilePath = path.join(os.tmpdir(), path.basename(filename))

  try {
    const ext = path.extname(filename).slice(1)
    const outputFormat = ext === 'jpg' ? 'jpeg' : ext // sharp uses “jpeg” instead of “jpg”

    if (outputFormat === 'png') {
      await sharp(filename)
        .png({ compressionLevel: 9, quality: 100 })
        .toFile(tempFilePath)
    } else if (outputFormat === 'webp') {
      await sharp(filename)
        .webp({ lossless: true })
        .toFile(tempFilePath)
    } else if (outputFormat === 'avif') {
      await sharp(filename)
        .avif({ lossless: true })
        .toFile(tempFilePath)
    } else if (outputFormat === 'gif') {
      execFileSync(gifsicle, ['-O3', filename, '-o', tempFilePath])
    } else {
      await sharp(filename)
        .toFormat(outputFormat, { quality: options[outputFormat]?.quality || 100 })
        .toFile(tempFilePath)
    }

    fs.copyFileSync(tempFilePath, filename)
    fs.unlinkSync(tempFilePath)

    const fileSizeAfter = size(filename)

    let color = 'white'
    let status = 'Skipped'
    let details = 'already compressed'

    if (fileSizeAfter < fileSizeBefore) {
      color = 'green'
      status = 'Compressed'
      details = `${sizeReadable(fileSizeBefore)} → ${sizeReadable(fileSizeAfter)}`
    } else if (fileSizeAfter > fileSizeBefore) {
      color = 'blue'
      status = 'Skipped'
      details = 'even more compressed'

      // Restore the backup’ed file
      fs.renameSync(filenameBackup, filename)
    }

    if (fs.existsSync(filenameBackup)) {
      fs.unlinkSync(filenameBackup)
    }

    console.info(
      chalk[color](`${status} ${filename} (${details})`)
    )

    if (fileSizeAfter === 0) {
      console.error(chalk.bold.red(`Something went wrong, new file size is ${sizeReadable(fileSizeAfter)}`))
    }

    return fileSizeAfter < fileSizeBefore ? fileSizeBefore - fileSizeAfter : 0
  } catch (err) {
    console.error(`Error compressing ${filename}:`, err)
    fs.renameSync(filenameBackup, filename)
    return 0
  }
}

const size = (file) => {
  return fs.statSync(file)['size']
}

const sizeReadable = (size) => `${(size / 1024).toFixed(2)} KB`

export const utils = { compression, sizeReadable }
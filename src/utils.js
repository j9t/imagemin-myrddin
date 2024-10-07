// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

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

  const fileSizeBefore = await size(filename)

  if (fileSizeBefore === 0) {
    console.info(chalk.blue(`Skipping ${filename}, it has ${sizeReadable(fileSizeBefore)}`))
    return 0
  }

  const tempFilePath = path.join(os.tmpdir(), path.basename(filename))

  try {
    const ext = path.extname(filename).slice(1)
    if (!ext) {
      throw new Error(`Cannot determine file type for ${filename}; no extension found.`)
    }
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
        .toFormat(outputFormat, { lossless: true, quality: 100 })
        .toFile(tempFilePath)
    }

    const fileSizeAfter = await size(tempFilePath)

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
    }

    if (dry) {
      console.info(chalk.gray(`Dry run: ${status} ${filename} (${details})`))
      fs.unlinkSync(tempFilePath)
      return 0
    }

    fs.copyFileSync(tempFilePath, filename)
    fs.unlinkSync(tempFilePath)

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
  } finally {
    try {
      fs.unlinkSync(filenameBackup)
    } catch (error) {
      // If the file doesn’t exist, no action is needed
    }
  }
}

const size = async (file) => {
  const stats = await fs.promises.stat(file)
  return stats.size
}

const sizeReadable = (size) => `${(size / 1024).toFixed(2)} KB`

export const utils = { compression, sizeReadable }
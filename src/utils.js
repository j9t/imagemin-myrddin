// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

import chalk from 'chalk'
import { execFileSync } from 'child_process'
import fs from 'fs'
import gifsicle from 'gifsicle'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

const logMessage = (message, dry, color = 'yellow') => {
  console.info(chalk[color](`${dry ? 'Dry run: ' : ''}${message}`))
}

const compression = async (filename, dry) => {
  const filenameBackup = `${filename}.bak`
  try {
    await fs.promises.copyFile(filename, filenameBackup)
  } catch (error) {
    console.error(chalk.red(`Error creating backup for ${filename}:`), error)
    return 0
  }

  const fileSizeBefore = await size(filename)

  if (fileSizeBefore === 0) {
    logMessage(`Skipped ${filename} (${sizeReadable(fileSizeBefore)})`, dry)
    return 0
  }

  const tempFilePath = path.join(os.tmpdir(), path.basename(filename))

  try {
    const ext = path.extname(filename).slice(1).toLowerCase()
    if (!ext) {
      throw new Error(`Cannot determine file type for ${filename}—no extension found`)
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
      try {
        execFileSync(gifsicle, ['-O3', filename, '-o', tempFilePath], { stdio: ['ignore', 'ignore', 'ignore'] })
      } catch (err) {
        logMessage(`Skipped ${filename} (appears corrupt)`, dry)
        return 0
      }
    } else {
      await sharp(filename)
        .toFormat(outputFormat, { quality: 100 })
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
      details = 'already better compressed'
    }

    logMessage(`${status} ${filename} (${details})`, dry, color)

    if (dry) {
      fs.unlinkSync(tempFilePath)
      return 0
    }

    await fs.promises.copyFile(tempFilePath, filename)
    await fs.promises.unlink(tempFilePath)

    if (fileSizeAfter === 0) {
      console.error(chalk.red(`Error doing something meaningful here—compressed file size is 0 for ${filename}`))
    }

    return fileSizeAfter < fileSizeBefore ? fileSizeBefore - fileSizeAfter : 0
  } catch (error) {
    console.error(chalk.red(`Error compressing ${filename}:`), error)
    await fs.promises.rename(filenameBackup, filename)
    return 0
  } finally {
    try {
      await fs.promises.unlink(filenameBackup)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(chalk.yellow(`Failed to delete backup file ${filenameBackup}:`), error)
      }
    }
  }
}

const size = async (file) => {
  const stats = await fs.promises.stat(file)
  return stats.size
}

const sizeReadable = (size) => `${(size / 1024).toFixed(2)} KB`

export const utils = { compression, sizeReadable }
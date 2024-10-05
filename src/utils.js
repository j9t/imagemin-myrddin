// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

import { filesize, partial } from 'filesize'
import fs from 'fs'
import path from 'path'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminOptipng from 'imagemin-optipng'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminWebp from 'imagemin-webp'
import imageminAvif from 'imagemin-avif'
import chalk from 'chalk'
import { options } from './plugins.js'

const compression = async (filename, dry) => {
  const filenameBackup = `${filename}.bak`
  fs.copyFileSync(filename, filenameBackup)

  const fileSizeBefore = size(filename)

  if (fileSizeBefore === 0) {
    console.info(chalk.blue(`Skipping ${filename}, it has ${filesize(fileSizeBefore)}`))
    return
  }

  let output = path.parse(filename).dir || './'
  if (dry) {
    output = `/tmp/imagemin-guard/${path.parse(filename).base}`
  }

  let option
  if (filename.endsWith('avif')) {
    option = imageminAvif(options.avif)
  } else if (filename.endsWith('gif')) {
    option = imageminGifsicle(options.gifsicle)
  } else if (filename.endsWith('jpg') || filename.endsWith('jpeg')) {
    option = imageminMozjpeg(options.mozjpeg)
  } else if (filename.endsWith('png')) {
    option = imageminOptipng(options.optipng)
  } else if (filename.endsWith('webp')) {
    option = imageminWebp(options.webp)
  } else {
    /* Hacky way of averting disaster */
    option = imageminGifsicle()
  }

  await imagemin([filename], {
    destination: output,
    plugins: [option],
  })
  const fileSizeAfter = size(`${output}/${path.parse(filename).base}`)

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
    console.error(chalk.bold.red(`Something went wrong, new file size is ${filesize(fileSizeAfter)}`))
  }

  return fileSizeAfter < fileSizeBefore ? fileSizeBefore - fileSizeAfter : 0
}

const size = (file) => {
  return fs.statSync(file)['size']
}

const sizeReadable = partial(size, { round: 5 })

export const utils = { compression, sizeReadable }
// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

import { globbySync } from 'globby'
import { hideBin } from 'yargs/helpers'
import simpleGit from 'simple-git'
import { styleText } from 'node:util'
import { utils } from './utils.js'
import _yargs from 'yargs'

(async () => {
  const yargs = _yargs(hideBin(process.argv))
  const argv = await yargs.argv

  // Share status
  const summary = (run) => {
    if (run) {
      console.info(styleText(['bold'], `\nDefensive base compression completed. You saved ${utils.sizeReadable(savedKB)}.`))
    } else {
      console.info(styleText(['bold'], 'There were no images to compress.'))
    }
  }

  // Files to be compressed
  const fileTypes = ['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp']
  console.log(`(Search pattern: ${fileTypes.join(', ')})\n`)

  let savedKB = 0

  const compress = async (files, dry) => {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      savedKB += await utils.compression(file, dry)
    }

    const run = files.length > 0
    summary(run)
  }

  const getFilePattern = (ignore) => {
    const patterns = []

    fileTypes.forEach((fileType) => {
      patterns.push(`**/*.${fileType}`, `**/*.${fileType.toUpperCase()}`)
    })

    if (ignore) {
      const ignorePaths = ignore.split(',')
      ignorePaths.forEach((path) => {
        patterns.push(`!${path}`)
      })
    }

    return patterns
  }

  const findFiles = (patterns, options = {}) => {
    return globbySync(patterns, { gitignore: true, ...options })
  }

  const patterns = getFilePattern(argv.ignore)
  let files = findFiles(patterns)
  let compressionFiles = files

  // Search for staged files
  if (argv.staged) {
    const git = simpleGit()
    try {
      const status = await git.status()
      compressionFiles = status.staged.filter(filename => files.includes(filename))
      await compress(compressionFiles, argv.dry)
    } catch (error) {
      console.error(error)
    }
  } else {
    await compress(compressionFiles, argv.dry)
  }
})()
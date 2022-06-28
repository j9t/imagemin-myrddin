// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

import rimraf from 'rimraf'
import { globbySync } from 'globby';
import sgf from 'staged-git-files'
import { utils } from './utils.js'
import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

(async () => {
  const yargs = _yargs(hideBin(process.argv));
  const argv = await yargs
    .argv

  // Test
  // console.log(argv)

  if(argv.dry){
    rimraf.sync('/tmp/imagemin-guard')
  }

  // Files to be optimized
  // const fileTypes = ['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp']
  const fileTypes = ['gif', 'jpg', 'jpeg', 'png']
  console.log(`(Search pattern: ${fileTypes.join(', ')})\n`)

  let savedKB = 0

  const compress = async (files, dry) => {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      savedKB += await utils.compression(file, dry)
    }

    const didRun = files.length > 0
    closingNote(didRun)
  }

  const getFilePattern = (ignore) => {
    const patterns = []

    fileTypes.forEach((fileType) => {
      patterns.push(`**/*.${fileType}`)
    })

    if(ignore){
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
  let compressFiles = files

  // Search for staged files
  if(argv.staged){
    sgf('A', async function(err, results){
      if(err){
        return console.error(err)
      }

      compressFiles = results
        .map(result => result.filename)
        .filter(filename => files.includes(filename))

      compress(compressFiles, argv.dry)
    })
  } else {
    compress(compressFiles, argv.dry)
  }

  // Share status
  const closingNote = (didRun) => {
    if(didRun){
      console.info(`\nImages optimized. You saved ${utils.sizeReadable(savedKB)}.`)
    } else {
      console.info('\nThere were no images to optimize.')
    }
  }

})()
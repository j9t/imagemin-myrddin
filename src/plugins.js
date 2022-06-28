// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

const mozjpeg = {
  // https://www.npmjs.com/package/imagemin-mozjpeg
  quality: 96
}

const optipng = {
  // https://www.npmjs.com/package/imagemin-optipng
}

const gifsicle = {
  // https://www.npmjs.com/package/imagemin-gifsicle
}

const webp = {
  // https://www.npmjs.com/package/imagemin-webp
  lossless: true
}

const avif = {
  // https://www.npmjs.com/package/imagemin-avif
  lossless: true
}

export const options = { mozjpeg, optipng, gifsicle, webp, avif }
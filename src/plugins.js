// This file, which had been forked from imagemin-merlin, was modified for imagemin-guard: https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master

const mozjpeg = {
  // see https://www.npmjs.com/package/imagemin-mozjpeg
  quality: 96
}

const optipng = {
  // see https://www.npmjs.com/package/imagemin-optipng
}

const gifsicle = {
  // see https://www.npmjs.com/package/imagemin-gifsicle
}

const webp = {
  // see https://www.npmjs.com/package/imagemin-webp
  lossless: true
}

const avif = {
  // see https://www.npmjs.com/package/imagemin-avif
  lossless: true
}

export const options = { mozjpeg, optipng, gifsicle, webp, avif }
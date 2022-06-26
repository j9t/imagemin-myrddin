const mozjpeg = {
  // see https://www.npmjs.com/package/imagemin-mozjpeg
  progressive: true,
}
const optipng = {
  // see https://www.npmjs.com/package/imagemin-optipng
}
const gifsicle = {
  // see https://www.npmjs.com/package/imagemin-gifsicle
}
const avif = {
  // see https://www.npmjs.com/package/imagemin-avif
  lossless: true,
}
const webp = {
  // see https://www.npmjs.com/package/imagemin-webp
  lossless: true,
}

export const options = { mozjpeg, optipng, gifsicle }
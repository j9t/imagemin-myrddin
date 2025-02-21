const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const simpleGit = require('simple-git')
const testFolder = path.join(__dirname, '../media/test')
const testFolderGit = path.join(__dirname, '../media/test-git')
const imageminGuardScript = path.join(__dirname, '../bin/imagemin-guard.js')
// Crutch to avoid files like .DS_Store to sneak in
// @@ Consolidate with package, to keep image definitions DRY (once there’s better Jest ESM support?)
const allowedFileTypes = ['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp']

// Function to copy files
function copyFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  fs.readdirSync(srcDir).forEach(file => {
    const srcFile = path.join(srcDir, file)
    const destFile = path.join(destDir, file)
    fs.copyFileSync(srcFile, destFile)
  })
}

// Function to check if images are compressed
const ignoreFiles = ['test#corrupt.gif']

function areImagesCompressed(dir) {
  const uncompressedFiles = []
  const allCompressed = fs.readdirSync(dir).every(file => {
    if (ignoreFiles.includes(file)) {
      // console.info(`Ignoring file: ${file}`)
      return true
    }
    const ext = path.extname(file).slice(1)
    if (!allowedFileTypes.includes(ext)) return true
    const filePath = path.join(dir, file)
    const originalFilePath = path.join(testFolder, file)
    try {
      const originalStats = fs.statSync(originalFilePath)
      const compressedStats = fs.statSync(filePath)
      const isCompressed = compressedStats.size < originalStats.size
      if (!isCompressed) {
        uncompressedFiles.push(file)
      }
      return isCompressed
    } catch (err) {
      console.warn(`Skipping corrupt file: ${file}`)
      return true
    }
  })
  return { allCompressed, uncompressedFiles }
}

// Function to check if images are already compressed
function areImagesAlreadyCompressed(dir) {
  return fs.readdirSync(dir).some(file => {
    const ext = path.extname(file).slice(1)
    if (!allowedFileTypes.includes(ext)) return false
    const filePath = path.join(dir, file)
    const originalFilePath = path.join(testFolder, file)
    const originalStats = fs.statSync(originalFilePath)
    const compressedStats = fs.statSync(filePath)
    return compressedStats.size >= originalStats.size
  })
}

describe('Imagemin Guard', () => {
  beforeAll(() => {
    // Back up original images
    copyFiles(testFolder, testFolderGit)
  })

  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(testFolderGit)) {
      fs.rmSync(testFolderGit, { recursive: true, force: true });
    }
  });

  test('Compress images', () => {
    // Ensure images in temp folder are not already compressed
    expect(areImagesAlreadyCompressed(testFolderGit)).toBe(true)

    // Run imagemin-guard script
    execSync(`node ${imageminGuardScript} --ignore=media/test`)

    // Verify images are compressed
    const { allCompressed, uncompressedFiles } = areImagesCompressed(testFolderGit)
    if (uncompressedFiles.length > 0) {
      console.log('The following files were not compressed:', uncompressedFiles.join(', '))
    }
    expect(allCompressed).toBe(true)
  })

  test('Compress only staged images', async () => {
    const git = simpleGit(testFolderGit)

    // Ensure the temp folder exists
    if (!fs.existsSync(testFolderGit)) {
      fs.mkdirSync(testFolderGit, { recursive: true })
    }

    // Initialize a temporary Git repository
    await git.init()
    await git.addConfig('user.name', 'Test User')
    await git.addConfig('user.email', 'test@example.com')

    // Stage files
    await git.add('.')

    // Run imagemin-guard script with --staged option
    execSync(`node ${imageminGuardScript} --staged`, { cwd: testFolderGit })

    // Verify images are compressed
    const { allCompressed, uncompressedFiles } = areImagesCompressed(testFolderGit)
    if (uncompressedFiles.length > 0) {
      console.log('The following files were not compressed:', uncompressedFiles.join(', '))
    }
    expect(allCompressed).toBe(true)
  })

  test('Do not modify files in dry run', () => {
    const originalStats = fs.readdirSync(testFolderGit).map(file => {
      const filePath = path.join(testFolderGit, file)
      return { file, stats: fs.statSync(filePath) }
    })
    execSync(`node ${imageminGuardScript} --dry`)
    const newStats = fs.readdirSync(testFolderGit).map(file => {
      const filePath = path.join(testFolderGit, file)
      return { file, stats: fs.statSync(filePath) }
    })
    originalStats.forEach((original, index) => {
      const newFile = newStats[index]
      expect(newFile.file).toStrictEqual(original.file)
      expect(newFile.stats.size).toStrictEqual(original.stats.size)
      expect(newFile.stats.mtime).toStrictEqual(original.stats.mtime)
    })
  })
})
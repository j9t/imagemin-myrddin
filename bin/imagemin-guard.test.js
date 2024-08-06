const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testFolder = path.join(__dirname, '../media/test');
const tempFolder = path.join(__dirname, '../media/temp');
const imageminGuardScript = path.join(__dirname, '../bin/imagemin-guard.js');

// Function to copy files
function copyFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.readdirSync(srcDir).forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
  });
}

// Function to check if images are compressed
function areImagesCompressed(dir) {
  // Implement a check based on actual compression logic
  return fs.readdirSync(dir).every(file => {
    const filePath = path.join(dir, file);
    const originalFilePath = path.join(testFolder, file);
    const originalStats = fs.statSync(originalFilePath);
    const compressedStats = fs.statSync(filePath);
    return compressedStats.size < originalStats.size;
  });
}

// Function to check if images are already compressed
function areImagesAlreadyCompressed(dir) {
  // Implement a check based on actual compression logic
  return fs.readdirSync(dir).some(file => {
    const filePath = path.join(dir, file);
    const originalFilePath = path.join(testFolder, file);
    const originalStats = fs.statSync(originalFilePath);
    const compressedStats = fs.statSync(filePath);
    return compressedStats.size >= originalStats.size;
  });
}

describe('imagemin-guard script', () => {
  beforeAll(() => {
    // Backup original images
    copyFiles(testFolder, tempFolder);
  });

  afterAll(() => {
    // Clean up temporary folder
    fs.rmSync(tempFolder, { recursive: true });
  });

  test('Compress images in media/test folder [in temp location]', () => {
    // Ensure images in temp folder are not already compressed
    expect(areImagesAlreadyCompressed(tempFolder)).toBe(true);

    // Run imagemin-guard script
    execSync(`node ${imageminGuardScript} --ignore=media/test`);

    // Verify images are compressed
    expect(areImagesCompressed(tempFolder)).toBe(true);
  });
});
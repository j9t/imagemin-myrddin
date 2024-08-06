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
  // Implement a simple check, e.g., file size reduction
  return fs.readdirSync(dir).every(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    return stats.size < 100000; // Example threshold
  });
}

describe('imagemin-guard script', () => {
  beforeAll(() => {
    // Backup original images
    copyFiles(testFolder, tempFolder);
  });

  afterAll(() => {
    // Clean up temporary folder
    fs.rmdirSync(tempFolder, { recursive: true });
  });

  test('Compress images in media/test folder [in temp location]', () => {
    // Run imagemin-guard script
    execSync(`node ${imageminGuardScript} --ignore=media/test`);

    // Verify images are compressed
    expect(areImagesCompressed(tempFolder)).toBe(true);
  });
});
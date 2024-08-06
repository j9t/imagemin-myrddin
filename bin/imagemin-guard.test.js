const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mediaTestFolder = path.join(__dirname, '/media/test');
const tempFolder = path.join(__dirname, '/media/temp');
const imageminGuardScript = path.join(__dirname, 'imagemin-guard.js');

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
    copyFiles(mediaTestFolder, tempFolder);
  });

  afterAll(() => {
    // Revert images to original state
    copyFiles(tempFolder, mediaTestFolder);
    // Clean up temporary folder
    fs.rmdirSync(tempFolder, { recursive: true });
  });

  test('should compress images in media/test folder', () => {
    // Run imagemin-guard script
    execSync(`node ${imageminGuardScript}`);

    // Verify images are compressed
    expect(areImagesCompressed(mediaTestFolder)).toBe(true);
  });
});
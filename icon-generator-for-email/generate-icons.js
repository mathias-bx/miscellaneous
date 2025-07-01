const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const inputDir = path.join(__dirname, 'icons-32px');
const outputDir = path.join(__dirname, 'png-icons');

async function convertSvgsToPngs() {
  try {
    await fs.ensureDir(outputDir);
    const files = await fs.readdir(inputDir);
    const svgFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === '.svg' && !file.startsWith('.');
    });

    for (const svgFile of svgFiles) {
      const inputPath = path.join(inputDir, svgFile);
      const outputFileName = `${path.basename(svgFile, '.svg')}.png`;
      const outputPath = path.join(outputDir, outputFileName);

      await sharp(inputPath)
        .resize(32, 32)
        .png()
        .toFile(outputPath);

      console.log(`Converted ${svgFile} to ${outputFileName}`);
    }

    console.log('All icons converted successfully!');
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

convertSvgsToPngs(); 
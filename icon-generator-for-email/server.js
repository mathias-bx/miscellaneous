const express = require('express');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const port = 3000;

const inputDir = path.join(__dirname, 'icons-32px');
const gradientsDir = path.join(__dirname, 'gradients');

app.use(express.static(__dirname));

app.get('/icons', async (req, res) => {
  try {
    const files = await fs.readdir(inputDir);
    const svgFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === '.svg' && !file.startsWith('.');
    });
    res.json(svgFiles);
  } catch (error) {
    res.status(500).send('Error reading icon directory');
  }
});

app.get('/gradients', async (req, res) => {
  try {
    const files = await fs.readdir(gradientsDir);
    const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');
    res.json(svgFiles);
  } catch (error) {
    res.status(500).send('Error reading gradients directory');
  }
});

app.get('/convert', async (req, res) => {
  const { icon, size: sizeStr, fillType, fillValue } = req.query;
  const size = parseInt(sizeStr, 10);

  if (!icon) {
    return res.status(400).send('Icon parameter is required');
  }
  if (!size || size < 1 || size > 2048) {
    return res.status(400).send('Invalid size parameter. Must be between 1 and 2048.');
  }

  const inputPath = path.join(inputDir, icon);

  if (!fs.existsSync(inputPath)) {
    return res.status(404).send('Icon not found');
  }

  try {
    let finalSvgBuffer;
    const svgContent = await fs.readFile(inputPath, 'utf-8');

    if (fillType === 'gradient') {
      const gradientPath = path.join(gradientsDir, fillValue);
      if (!fs.existsSync(gradientPath)) {
        return res.status(404).send('Gradient not found');
      }
      const gradientContent = await fs.readFile(gradientPath, 'base64');
      const gradientDataUri = `data:image/svg+xml;base64,${gradientContent}`;

      const patternId = 'gradient-fill';
      const defs = `
        <defs>
          <pattern id="${patternId}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1">
            <image href="${gradientDataUri}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" />
          </pattern>
        </defs>
      `;

      let finalSvg = svgContent.replace(/<svg(.*?)>/, `<svg$1>${defs}`);
      finalSvg = finalSvg.replace(/fill="(black|#000|#000000)"/g, `fill="url(#${patternId})"`);
      finalSvgBuffer = Buffer.from(finalSvg);

    } else {
      const coloredSvg = svgContent.replace(/fill="(black|#000|#000000)"/g, `fill="${fillValue || '#000000'}"`);
      finalSvgBuffer = Buffer.from(coloredSvg);
    }

    const pngBuffer = await sharp(finalSvgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (error) {
    console.error('--- SVG Conversion Error ---');
    console.error('Icon:', icon);
    console.error('Size:', size);
    console.error('Fill:', req.query.fillValue);
    console.error('Sharp Error:', error);
    console.error('--------------------------');
    res.status(500).send('Error converting icon');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
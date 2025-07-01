const express = require('express');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const port = 3000;

const inputDir = path.join(__dirname, 'icons-32px');

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

app.get('/convert', async (req, res) => {
  const icon = req.query.icon;
  const size = parseInt(req.query.size, 10);

  if (!icon) {
    return res.status(400).send('Icon parameter is required');
  }

  if (!size || size < 1 || size > 2048) {
    return res.status(400).send('Invalid size parameter. Must be a number between 1 and 2048.');
  }

  const inputPath = path.join(inputDir, icon);

  if (!fs.existsSync(inputPath)) {
    return res.status(404).send('Icon not found');
  }

  try {
    const pngBuffer = await sharp(inputPath)
      .resize(size, size)
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (error) {
    res.status(500).send('Error converting icon');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
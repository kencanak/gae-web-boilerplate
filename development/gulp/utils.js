const fs = require('fs');

const CONFIG = require('./config');

const getPageData = (type) => {
  let isFolder = true;

  const filePath = `${CONFIG.SRC.DATA}/${type}`;
  try {
    isFolder = fs.lstatSync(filePath).isDirectory();
  } catch (e) {
    isFolder = false;
  }

  if (!isFolder) {
    const data = JSON.parse(fs.readFileSync(`${filePath}.json`));
    return data;
  }

  const files = fs.readdirSync(filePath);

  return files.map((file) => {
    return JSON.parse(fs.readFileSync(`${filePath}/${file}`));
  });
};

module.exports = {
  getPageData,
};

// Transform jest file imports to return filename as string
// http://facebook.github.io/jest/docs/tutorial-webpack.html

const path = require("path");

module.exports = {
  process(src, filename) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  }
};

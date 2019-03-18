const fs = require('fs');
const os = require('os');

const argv = require('yargs')
  .command('<markdown-file-path>')
  .argv;

const mdFilePath = argv._[0];

generateCodeFromMarkdown(mdFilePath);


/**
 * functions
 */

function generateCodeFromMarkdown(mdFilePath) {
  let codeLines = [];
  let codeFilePath = undefined;
  
  fs.readFileSync(mdFilePath, 'utf8').split(os.EOL).forEach(line => {
    if (codeStart(line)) {
      codeFilePath = getCodeFilePath(line);
    } else if (codeEnd(line)) {
      putCodeToFile(codeLines, codeFilePath);
      codeFilePath = undefined;
      codeLines = [];
    } else {
      if (typeof codeFilePath === 'string') {
        codeLines.push(line);
      }
    }
  });
}


function codeStart(line) {
  return /^```[^\s]+\s[^\s]+$/.test(line);
}

function codeEnd(line) {
  return /^```$/.test(line);
}

function getCodeFilePath(line) {
  if (codeStart(line)) {
    return line.split(' ')[1];
  } else {
    return undefined;
  }
}

function putCodeToFile(codeLines, codeFilePath) {
  if (codeLines.length > 0 && typeof codeFilePath === 'string') {
    fs.appendFileSync(codeFilePath, codeLines.join(os.EOL));
  }
}




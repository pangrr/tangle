const fs = require('fs');
const fsExtra = require('fs-extra');
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
  const codeFiles = [];
  const codeInserts = [];
  /*
  interface CodeFile {
    filePath: string;
    insertAt?: string;
    code: string[];
  }
  */
  let codeFile;

  fs.readFileSync(mdFilePath, 'utf8').split(os.EOL).forEach(line => {
    if (codeStart(line)) {
      codeFile = createCodeFile(line);
    } else if (codeEnd(line)) {
      if (codeFile) {
        if (codeFile.insertAt) {
          codeInserts.push(codeFile);
        } else {
          codeFiles.push(codeFile);
        }
        codeFile = undefined;
      }
    } else {
      if (codeFile) {
        codeFile.code.push(line);
      }
    }
  });
  /*
  interface MergedCodeFiles {
    [filePath: string]: string[]
  }
  */
  const mergedCodeFiles = mergeCodeFiles(codeFiles);
  insertCode(mergedCodeFiles, codeInserts);
  removeInsertLocations(mergedCodeFiles);
  writeCodeFiles(mergedCodeFiles);
}


function removeInsertLocations(mergedCodeFiles) {
  Object.keys(mergedCodeFiles).forEach(filePath => {
    const cleanCodeLines = [];
    mergedCodeFiles[filePath].forEach(codeLine => {
      if (codeLine.trim().indexOf('@') !== 0) {
        cleanCodeLines.push(codeLine);
      }
    });
    mergedCodeFiles[filePath] = cleanCodeLines;
  });
}


function insertCode(mergedCodeFiles, codeInserts) {
  const codeInsertsLeft = [];
  for (let fromCodeFile of codeInserts) {
    const toCodeLines = mergedCodeFiles[fromCodeFile.filePath];
    if (toCodeLines) {
      const insertLocation = getInsertLocation(toCodeLines, fromCodeFile.insertAt);
      if (insertLocation >= 0) {
        toCodeLines.splice(insertLocation, 0, ...fromCodeFile.code);
        continue;
      }
    }
    codeInsertsLeft.push(fromCodeFile);
  }
  if (codeInsertsLeft.length < codeInserts) {
    insertCode(mergedCodeFiles, codeInsertsLeft);
  }
}


function getInsertLocation(codeLines, insertAt) {
  switch (insertAt) {
  case 'top':
    return 0;
  case 'bottom':
    return codeLines.length;
  default:
    for (let i = 0; i < codeLines.length; i++) {
      if (codeLines[i].trim() === `@${insertAt}`) {
        return i;
      }
    }
    return -1;
  }
}


function mergeCodeFiles(codeFiles) {
  const mergedCodeFiles = {};
  codeFiles.forEach(codeFile => {
    if (!mergedCodeFiles[codeFile.filePath]) {
      mergedCodeFiles[codeFile.filePath] = [];
    }
    mergedCodeFiles[codeFile.filePath].push(...codeFile.code);
  });
  return mergedCodeFiles;
}


function writeCodeFiles(mergedCodeFiles) {
  Object.keys(mergedCodeFiles).forEach(filePath => {
    fsExtra.ensureFileSync(filePath);
    fs.writeFileSync(filePath, mergedCodeFiles[filePath].join(os.EOL));
  });
}


function codeStart(line) {
  return line.indexOf('```') === 0 && line.split(' ').length > 1;
}


function codeEnd(line) {
  return line === '```';
}


function createCodeFile(line) {
  const lineTokens = line.split(' ');
  const filePath = lineTokens[1];
  const insertAt = lineTokens[2];

  if (!filePath) {
    return false;
  } else {
    return {
      filePath,
      insertAt,
      code: []
    };
  }
}

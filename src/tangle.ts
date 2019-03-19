#!/usr/bin/env node
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as os from 'os';
import * as yargs from 'yargs';

yargs.demandCommand(1).usage('Usage: $0 [markdown_file_path]');
generateCodeFromMarkdown(yargs.argv._[0]);





function generateCodeFromMarkdown(mdFilePath: string): void {
  const codeFiles: CodeFile[] = [];
  const codeInserts: CodeInsert[] = [];
  let codeBlock: CodeFile | CodeInsert | undefined;

  fs.readFileSync(mdFilePath, 'utf8').split(os.EOL).forEach((line: string) => {
    if (codeStart(line)) {
      codeBlock = createCodeBlock(line);
    } else if (codeEnd(line)) {
      if (codeBlock) {
        if (isCodeInsert(codeBlock)) {
          codeInserts.push(codeBlock);
        } else {
          codeFiles.push(codeBlock);
        }
        codeBlock = undefined;
      }
    } else {
      if (codeBlock) {
        codeBlock.codeLines.push(line);
      }
    }
  });

  const mergedCodeFiles: MergedCodeFiles = mergeCodeFiles(codeFiles);
  insertCode(mergedCodeFiles, codeInserts);
  removeInsertLocations(mergedCodeFiles);
  writeCodeFiles(mergedCodeFiles);
}


function removeInsertLocations(mergedCodeFiles: MergedCodeFiles): void {
  Object.keys(mergedCodeFiles).forEach(filePath => {
    const cleanCodeLines: string[] = [];
    mergedCodeFiles[filePath].forEach(codeLine => {
      if (codeLine.trim().indexOf('@') !== 0) {
        cleanCodeLines.push(codeLine);
      }
    });
    mergedCodeFiles[filePath] = cleanCodeLines;
  });
}


function insertCode(mergedCodeFiles: MergedCodeFiles, codeInserts: CodeInsert[]): void {
  const codeInsertsLeft: CodeInsert[] = [];
  for (let fromCodeFile of codeInserts) {
    const toCodeLines = mergedCodeFiles[fromCodeFile.filePath];
    if (toCodeLines) {
      const insertLocation = getInsertLocation(toCodeLines, fromCodeFile.insertAt);
      if (insertLocation >= 0) {
        toCodeLines.splice(insertLocation, 0, ...fromCodeFile.codeLines);
        continue;
      }
    }
    codeInsertsLeft.push(fromCodeFile);
  }
  if (codeInsertsLeft.length < codeInserts.length) {
    insertCode(mergedCodeFiles, codeInsertsLeft);
  }
}


function getInsertLocation(codeLines: string[], insertAt: string): number {
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


function mergeCodeFiles(codeFiles: CodeFile[]): MergedCodeFiles {
  const mergedCodeFiles: MergedCodeFiles = {};
  codeFiles.forEach(codeFile => {
    if (!mergedCodeFiles[codeFile.filePath]) {
      mergedCodeFiles[codeFile.filePath] = [];
    }
    mergedCodeFiles[codeFile.filePath].push(...codeFile.codeLines);
  });
  return mergedCodeFiles;
}


function writeCodeFiles(mergedCodeFiles: MergedCodeFiles): void {
  Object.keys(mergedCodeFiles).forEach(filePath => {
    fsExtra.ensureFileSync(filePath);
    fs.writeFileSync(filePath, mergedCodeFiles[filePath].join(os.EOL));
  });
}


function codeStart(line: string): boolean {
  return line.indexOf('```') === 0 && line.split(' ').length > 1;
}


function codeEnd(line: string): boolean {
  return line === '```';
}


function createCodeBlock(line: string): CodeFile | CodeInsert | undefined {
  const lineTokens = line.split(' ');
  const filePath = lineTokens[1];
  const insertAt = lineTokens[2];

  if (!filePath) {
    return undefined;
  } else {
    return {
      filePath,
      insertAt,
      codeLines: []
    };
  }
}


interface CodeFile {
  readonly filePath: string;
  readonly codeLines: string[];
}


interface CodeInsert {
  readonly filePath: string;
  readonly insertAt: string;
  readonly codeLines: string[];
}


interface MergedCodeFiles {
  [key: string]: string[];
}


function isCodeInsert(codeBlock: CodeFile | CodeInsert): codeBlock is CodeInsert {
  return (<CodeInsert>codeBlock).insertAt !== undefined;
}

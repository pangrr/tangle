#!/usr/bin/env node
import * as fs from 'fs';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';

const argv = yargs
  .demandCommand(1)
  .usage('Usage: $0 [markdown_file_path] -d [save_dir]')
  .default('d', '.')
  .argv;

md2Code(argv._[0], <string>argv.d);

function extractBaseCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
function extractInsertCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
interface Code {
  [filePath: string]: {
    baseCode: string;
    insertCode: {
      [insertPoint: string]: string;
    };
  };
}
function parseBlockCodeString(blockCodeString: string): Code {
  const lines = blockCodeString.split('\n');
  const firstLineTokens = lines[1].replace(/[ \t]+/g, ' ').split(' ');
  const code = lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n';
  const filePaths = firstLineTokens[1].split(',');
  const insertPoint = firstLineTokens[2];

  const codeObj: Code = {};

  filePaths.forEach(filePath => {
    codeObj[filePath] = {
      baseCode: '',
      insertCode: {}
    };
    if (insertPoint) codeObj[filePath].insertCode[insertPoint] = code;
    else codeObj[filePath].baseCode = code;
    return codeObj;
  });

  return codeObj;
}
function addOneCode(newCode: Code, existingCode: Code): void {
  Object.keys(newCode).forEach(filePath => {
    const newCodeBody = newCode[filePath];
    const existingCodeBody = existingCode[filePath];

    if (existingCodeBody) {
      if (newCodeBody.baseCode) {
        existingCodeBody.baseCode = existingCodeBody.baseCode + newCodeBody.baseCode;
      } else {
        Object.keys(newCodeBody.insertCode).forEach(insertPoint => {
          existingCodeBody.insertCode[insertPoint] = (existingCodeBody.insertCode[insertPoint] || '') + newCodeBody.insertCode[insertPoint];
        });
      }
    } else {
      existingCode[filePath] = newCodeBody;
    }
  });
}
function insertCode(allCode: Code): void {
  Object.keys(allCode).forEach(filePath => {
    const sameFileCode = allCode[filePath];
    let anyCodeInserted = true;
    while (anyCodeInserted) {
      anyCodeInserted = false;
      Object.keys(sameFileCode.insertCode).forEach(insertPoint => {
        const insertCode = sameFileCode.insertCode[insertPoint];
        if (insertCode) {
          if (sameFileCode.baseCode.includes(insertPoint)) {
            sameFileCode.baseCode = sameFileCode.baseCode.replace(new RegExp(insertPoint, 'g'), insertCode);
            anyCodeInserted = true;
          }
        }
      });
    }
  });
}
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
function dumpCode(code: Code, saveDir: string): void {
  Object.keys(code).forEach(filePath => {
    const absoluteFilePath = path.join(saveDir, filePath);
    fsx.ensureFileSync(absoluteFilePath);
    fs.writeFileSync(absoluteFilePath, code[filePath].baseCode);
  });
} 
function unifyNewLineChar(text: string): string {
  return text.replace(/\r\n/g, '\n');
}
function shouldNotStartWithBlockCode(text: string): void {
  const firstLine = text.split('\n')[0];
  if (/[ \t]*```\S*[ \t]+\S+[ \t]*/.test(firstLine) || /[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*/.test(firstLine)) throw 'markdown should not start with a block code';
}
function appendNewLineToBlockCodeEnd(text: string): string {
  return text.replace(/\n[ \t]*```[ \t]*\n/g, '\n```\n\n');
}
function appendNewLine(text: string): string {
  return text + '\n';
}
function preprocessMdString(text: string): string {
  return appendNewLine(
    appendNewLineToBlockCodeEnd(
      unifyNewLineChar(text)
    )
  );
}
function validateMdString(text: string): void {
  shouldNotStartWithBlockCode(text);
}
function md2Code(mdFilePath: string, saveDir: string): void {
  const mdString = preprocessMdString(readFile(mdFilePath));
  validateMdString(mdString);
  const codeStrings = extractBaseCode(mdString).concat(extractInsertCode(mdString));
  const code = codeStrings.reduce((code: Code, codeString) => {
    addOneCode(parseBlockCodeString(codeString), code);
    return code;
  }, {});
  insertCode(code);
  dumpCode(code, saveDir);
}


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
md2code(argv._[0], <string>argv.d);



function md2code(mdFilePath: string, saveDir: string): void {
  const mdContent = readFileAndUnifyNewLine(mdFilePath);
  const baseCodeBlocks: BaseCodeBlock[] = extractBaseCodeBlocks(mdContent);
  const insertionCodeBlocks: InsertionCodeBlock[] = extractInsertionCodeBlocks(mdContent);
  const reducedBaseCodeBlocks: BaseCodeBlock[] = reduceBaseCodeBlocks(baseCodeBlocks);
  const reducedInsertionCodeBlocks: InsertionCodeBlock[] = reduceInsertionCodeBlocks(insertionCodeBlocks);
  const reducedCodeBlocks: BaseCodeBlock[] = reduceCodeBlocks(reducedBaseCodeBlocks, reducedInsertionCodeBlocks);
  dumpCodeBlocks(reducedCodeBlocks, saveDir);
}


function extractInsertionCodeBlocks(text: string): InsertionCodeBlock[] {
  return (text.match(/\n```\S* +\S+ +\S+\n[\s\S]*?\n```\n/g) || []).map(str => parseInsertCodeBlock(str));
}


function extractBaseCodeBlocks(text: string): BaseCodeBlock[] {
  return (text.match(/\n```\S* +\S+\n[\s\S]*?\n```\n/g) || []).map(str => parseBaseCodeBlock(str));
}


function readFileAndUnifyNewLine(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8').replace('\r\n', '\n');
}


function reduceCodeBlocks(baseCodeBlocks: BaseCodeBlock[], insertionCodeBlocks: InsertionCodeBlock[]): BaseCodeBlock[] {
  insertionCodeBlocks.forEach(insertionCodeBlock => {
    const sameFilePathBaseCodeBlock = getSameFilePathCodeBlock<BaseCodeBlock>(baseCodeBlocks, insertionCodeBlock);
    if (sameFilePathBaseCodeBlock) insertCodeBlock(insertionCodeBlock, sameFilePathBaseCodeBlock);
  });
  return baseCodeBlocks;
}


function reduceInsertionCodeBlocks(insertionCodeBlocks: InsertionCodeBlock[]): InsertionCodeBlock[] {
  return insertionCodeBlocks.reduce(
    (diffFilePathCodeBlocks: InsertionCodeBlock[], codeBlock) => {
      const sameFilePathAndInsertLocationCodeBlock = getSameFilePathInsertLocationCodeBlock(diffFilePathCodeBlocks, codeBlock);
      if (!sameFilePathAndInsertLocationCodeBlock) diffFilePathCodeBlocks.push(codeBlock);
      else sameFilePathAndInsertLocationCodeBlock.code = sameFilePathAndInsertLocationCodeBlock.code + codeBlock.code;
      return diffFilePathCodeBlocks;
    },
    []
  ).reduce(
    (noDepCodeBlocks: InsertionCodeBlock[], codeBlock, i, allCodeBlocks) => {
      const insertToCodeBlock = getInsertToCodeBlock<InsertionCodeBlock>(allCodeBlocks, codeBlock);
      if (!insertToCodeBlock) noDepCodeBlocks.push(codeBlock);
      else insertCodeBlock(codeBlock, insertToCodeBlock);
      return noDepCodeBlocks;
    },
    []
  );
}


function getInsertToCodeBlock<T extends CodeBlock>(codeBlocks: T[], fromCodeBlock: InsertionCodeBlock): T | undefined {
  for (let codeBlock of codeBlocks) {
    if (codeBlock.code.includes(fromCodeBlock.insertLocation)) {
      return codeBlock;
    }
  }
  return undefined;
}


function insertCodeBlock(fromCodeBlock: InsertionCodeBlock, toCodeBlock: CodeBlock): void {
  toCodeBlock.code = toCodeBlock.code.replace(fromCodeBlock.insertLocation, fromCodeBlock.code);
}


function reduceBaseCodeBlocks(baseCodeBlocks: BaseCodeBlock[]): BaseCodeBlock[] {
  return baseCodeBlocks.reduce(
    (diffFilePathCodeBlocks: BaseCodeBlock[], codeBlock) => {
      const sameFilePathCodeBlock = getSameFilePathCodeBlock<BaseCodeBlock>(diffFilePathCodeBlocks, codeBlock);
      if (!sameFilePathCodeBlock) diffFilePathCodeBlocks.push(codeBlock);
      else sameFilePathCodeBlock.code = sameFilePathCodeBlock.code + codeBlock.code;
      return diffFilePathCodeBlocks;
    },
    []
  );  
}


function getSameFilePathCodeBlock<T extends CodeBlock>(codeBlocks: T[], codeBlock: CodeBlock): T | undefined {
  for (let _codeBlock of codeBlocks) {
    if (_codeBlock.filePath === codeBlock.filePath) return _codeBlock;
  }
  return undefined;
}


function getSameFilePathInsertLocationCodeBlock(codeBlocks: InsertionCodeBlock[], codeBlock: InsertionCodeBlock): InsertionCodeBlock | undefined {
  for (let _codeBlock of codeBlocks) {
    if (_codeBlock.filePath === codeBlock.filePath && _codeBlock.insertLocation === codeBlock.insertLocation) return _codeBlock;
  }
  return undefined;
}


function parseBaseCodeBlock(codeBlock: string): BaseCodeBlock {
  return {
    filePath: getFilePathFromCodeBlock(codeBlock),
    code: getCodeFromCodeBlock(codeBlock)
  };
}


function parseInsertCodeBlock(codeBlock: string): InsertionCodeBlock {
  return {
    filePath: getFilePathFromCodeBlock(codeBlock),
    insertLocation: getInsertLocationFromCodeBlock(codeBlock),
    code: getCodeFromCodeBlock(codeBlock)
  };
}


function getFilePathFromCodeBlock(codeBlock: string): string {
  return codeBlock.split('\n')[1].split(' ')[1];
}


function getInsertLocationFromCodeBlock(codeBlock: string): string {
  return codeBlock.split('\n')[1].split(' ')[2];
}


function getCodeFromCodeBlock(codeBlock: string): string {
  const lines = codeBlock.split('\n');
  return lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n';
}


function dumpCodeBlocks(codeBlocks: BaseCodeBlock[], saveDir: string): void {
  codeBlocks.forEach(codeBlock => {
    const absoluteFilePath = path.join(saveDir, codeBlock.filePath);
    fsx.ensureFileSync(absoluteFilePath);
    fs.writeFileSync(absoluteFilePath, codeBlock.code);
  });
}


interface BaseCodeBlock {
  filePath: string;
  code: string;
}


interface InsertionCodeBlock {
  filePath: string;
  insertLocation: string;
  code: string;
}


type CodeBlock = BaseCodeBlock | InsertionCodeBlock;

#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fsExtra = require("fs-extra");
const os = require("os");
const yargs = require("yargs");
yargs.usage('Usage: $0 [markdown_file_path]');
generateCodeFromMarkdown(yargs.argv._[0]);
function generateCodeFromMarkdown(mdFilePath) {
    const codeFiles = [];
    const codeInserts = [];
    let codeBlock;
    fs.readFileSync(mdFilePath, 'utf8').split(os.EOL).forEach((line) => {
        if (codeStart(line)) {
            codeBlock = createCodeBlock(line);
        }
        else if (codeEnd(line)) {
            if (codeBlock) {
                if (isCodeInsert(codeBlock)) {
                    codeInserts.push(codeBlock);
                }
                else {
                    codeFiles.push(codeBlock);
                }
                codeBlock = undefined;
            }
        }
        else {
            if (codeBlock) {
                codeBlock.codeLines.push(line);
            }
        }
    });
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
        mergedCodeFiles[codeFile.filePath].push(...codeFile.codeLines);
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
function createCodeBlock(line) {
    const lineTokens = line.split(' ');
    const filePath = lineTokens[1];
    const insertAt = lineTokens[2];
    if (!filePath) {
        return undefined;
    }
    else {
        return {
            filePath,
            insertAt,
            codeLines: []
        };
    }
}
function isCodeInsert(codeBlock) {
    return codeBlock.insertAt !== undefined;
}

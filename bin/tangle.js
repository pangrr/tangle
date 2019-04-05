#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fsx = require("fs-extra");
const path = require("path");
const yargs = require("yargs");
const argv = yargs
    .demandCommand(1)
    .usage('Usage: $0 [markdown_file_path] -d [save_dir]')
    .default('d', '.')
    .argv;
md2Code(argv._[0], argv.d);
function extractBaseCode(text) {
    return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
function extractInsertCode(text) {
    return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
function parseBlockCodeString(blockCodeString) {
    const lines = blockCodeString.split('\n');
    const firstLineTokens = lines[1].replace(/[ \t]+/g, ' ').split(' ');
    const code = lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n';
    const filePath = firstLineTokens[1];
    const insertPoint = firstLineTokens[2];
    const codeObj = {
        [filePath]: {
            baseCode: '',
            insertCode: {}
        }
    };
    if (insertPoint)
        codeObj[filePath].insertCode[insertPoint] = code;
    else
        codeObj[filePath].baseCode = code;
    return codeObj;
}
function addOneCode(newCode, existingCode) {
    Object.keys(newCode).forEach(filePath => {
        const newCodeBody = newCode[filePath];
        const existingCodeBody = existingCode[filePath];
        if (existingCodeBody) {
            if (newCodeBody.baseCode) {
                existingCodeBody.baseCode = existingCodeBody.baseCode + newCodeBody.baseCode;
            }
            else {
                Object.keys(newCodeBody.insertCode).forEach(insertPoint => {
                    existingCodeBody.insertCode[insertPoint] = (existingCodeBody.insertCode[insertPoint] || '') + newCodeBody.insertCode[insertPoint];
                });
            }
        }
        else {
            existingCode[filePath] = newCodeBody;
        }
    });
}
function addMissingBaseCode(allCode) {
    Object.keys(allCode).forEach(filePath => {
        const sameFileCode = allCode[filePath];
        if (!sameFileCode.baseCode) {
            try {
                sameFileCode.baseCode = fs.readFileSync(filePath, 'utf8');
            }
            catch (e) { }
        }
    });
}
function insertCode(allCode) {
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
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}
function dumpCode(code, saveDir) {
    Object.keys(code).forEach(filePath => {
        const absoluteFilePath = path.join(saveDir, filePath);
        fsx.ensureFileSync(absoluteFilePath);
        fs.writeFileSync(absoluteFilePath, code[filePath].baseCode);
    });
}
function unifyNewLineChar(text) {
    return text.replace(/\r\n/g, '\n');
}
function shouldNotStartWithBlockCode(text) {
    const firstLine = text.split('\n')[0];
    if (/[ \t]*```\S*[ \t]+\S+[ \t]*/.test(firstLine) || /[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*/.test(firstLine))
        throw 'markdown should not start with a block code';
}
function appendNewLineToBlockCodeEnd(text) {
    return text.replace(/\n[ \t]*```[ \t]*\n/g, '\n```\n\n');
}
function appendNewLine(text) {
    return text + '\n';
}
function preprocessMdString(text) {
    return appendNewLine(appendNewLineToBlockCodeEnd(unifyNewLineChar(text)));
}
function validateMdString(text) {
    shouldNotStartWithBlockCode(text);
}
function md2Code(mdFilePath, saveDir) {
    const mdString = preprocessMdString(readFile(mdFilePath));
    validateMdString(mdString);
    const codeStrings = extractBaseCode(mdString).concat(extractInsertCode(mdString));
    const code = codeStrings.reduce((code, codeString) => {
        addOneCode(parseBlockCodeString(codeString), code);
        return code;
    }, {});
    addMissingBaseCode(code);
    insertCode(code);
    dumpCode(code, saveDir);
}

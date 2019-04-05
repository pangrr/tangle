Basically we extract code from markdown and organize the code into files.

- [Define & Extract Code](#define--extract-code)
  * [Define Code](#define-code)
  * [Store Code](#store-code)
- [Organize Code Into Files](#organize-code-into-files)
  * [Merge Code Of Same File And Insert Point](#merge-code-of-same-file-and-insert-point)
  * [Check Missing Base Code From Files](#check-missing-base-code-from-files)
  * [Insert Code](#insert-code)
- [Appendix](#appendix)
  * [Read a markdown file into a string.](#read-a-markdown-file-into-a-string)
  * [Dump code into files.](#dump-code-into-files)
  * [Cli](#cli)
  * [Regex limitations and work around](#regex-limitations-and-work-around)
  * [Main](#main)
  * [Imports](#imports)
  * [Put everything together.](#put-everything-together)

# Define & Extract Code
## Define Code
Use block code and not use inline code because custom information can be easily attached to block code mark but not to inline code.

Code location can be appended to the start line of a block code like ` ``` <filePath> <insertPoint>`. Note that `<insertPoint>` can be optional because some kind of code, like functions, can be put almost any where in a file. Why bother assign a location? 

Thus comes 2 types of code:
1. base code, starting with ` ``` <filePath>`, extracted by 
```ts tangle.ts @functions
function extractBaseCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```
2. insert code, starting with ` ``` <filePath> <insertPoint>`, extracted by 
```ts tangle.ts @functions
function extractInsertCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```
## Store Code
Then convert extracted strings into json objects. First the interface:
```ts tangle.ts @functions
interface Code {
  [filePath: string]: {
    baseCode: string;
    insertCode: {
      [insertPoint: string]: string;
    };
  };
}
```
```ts tangle.ts @functions
function parseBlockCodeString(blockCodeString: string): Code {
  const lines = blockCodeString.split('\n');
  const firstLineTokens = lines[1].replace(/[ \t]+/g, ' ').split(' ');
  const code = lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n';
  const filePath = firstLineTokens[1];
  const insertPoint = firstLineTokens[2];
  const codeObj: Code = {
    [filePath]: {
      baseCode: '',
      insertCode: {}
    }
  };
  if (insertPoint) codeObj[filePath].insertCode[insertPoint] = code;
  else codeObj[filePath].baseCode = code;
  return codeObj;
}
```

# Organize Code Into Files
## Merge Code Of Same File And Insert Point
As each extracted string is converted into `Code` object one by one, concat code of identical `filePath` and `insertPoint`.
```ts tangle.ts @functions
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
```

## Check Missing Base Code From Files
It's possible that for some insert code there is no base code of the same file. In this case we can try to find the base code among existing code files.
```ts tangle.ts @functions
function addMissingBaseCode(allCode: Code): void {
  Object.keys(allCode).forEach(filePath => {
    const sameFileCode = allCode[filePath];
    if (!sameFileCode.baseCode) {
      try {
        sameFileCode.baseCode = fs.readFileSync(filePath, 'utf8');
      } catch (e) {}
    }
  });
}
```

## Insert Code
Put insert code into base code of the same `filePath`. **Note** the case where an insert code may need to be put into another insert code. To make sure as many as possible insert code get inserted, keep inserting until no more code can be inserted.
```ts tangle.ts @functions
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
```

Now the `baseCode` in the `Code` object is organized by `filePath` and ready to be put into files.







# Appendix
## Read a markdown file into a string.
```ts tangle.ts @functions
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
```
## Dump code into files.
```ts tangle.ts @functions
function dumpCode(code: Code, saveDir: string): void {
  Object.keys(code).forEach(filePath => {
    const absoluteFilePath = path.join(saveDir, filePath);
    fsx.ensureFileSync(absoluteFilePath);
    fs.writeFileSync(absoluteFilePath, code[filePath].baseCode);
  });
} 
```
## Cli
```ts tangle.ts @cli
const argv = yargs
  .demandCommand(1)
  .usage('Usage: $0 [markdown_file_path] -d [save_dir]')
  .default('d', '.')
  .argv;

md2Code(argv._[0], <string>argv.d);
```
## Regex limitations and work around
- **`\r\n` breaks the match.** Replace `\r\n` with `\n`.
```ts tangle.ts @functions
function unifyNewLineChar(text: string): string {
  return text.replace(/\r\n/g, '\n');
}
```
- **Block code starting at the first line of a file is ignored.** This situation should be discouraged. Let's check and throw an error.
```ts tangle.ts @functions
function shouldNotStartWithBlockCode(text: string): void {
  const firstLine = text.split('\n')[0];
  if (/[ \t]*```\S*[ \t]+\S+[ \t]*/.test(firstLine) || /[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*/.test(firstLine)) throw 'markdown should not start with a block code';
}
```
- **Code blocks immediately below another code block is ignored.** Add a new line after each code block.
```ts tangle.ts @functions
function appendNewLineToBlockCodeEnd(text: string): string {
  return text.replace(/\n[ \t]*```[ \t]*\n/g, '\n```\n\n');
}
```
- **Code blocks end with last line is ignored.** Add a new line at the end of markdown.
```ts tangle.ts @functions
function appendNewLine(text: string): string {
  return text + '\n';
}
```

Let group above functions into preprocess and validation.
```ts tangle.ts @functions
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
```

## Main
```ts tangle.ts @functions
function md2Code(mdFilePath: string, saveDir: string): void {
  const mdString = preprocessMdString(readFile(mdFilePath));
  validateMdString(mdString);
  const codeStrings = extractBaseCode(mdString).concat(extractInsertCode(mdString));
  const code = codeStrings.reduce((code: Code, codeString) => {
    addOneCode(parseBlockCodeString(codeString), code);
    return code;
  }, {});
  addMissingBaseCode(code);
  insertCode(code);
  dumpCode(code, saveDir);
}
```
## Imports
```ts tangle.ts @imports
#!/usr/bin/env node
import * as fs from 'fs';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
```
## Put everything together.
```ts tangle.ts
@imports
@cli
@functions
```

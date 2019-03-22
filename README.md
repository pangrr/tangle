`tangle` is a literate programming tool to generate code from markdown files.

**Free our mind writers.** We should express our ideas. Don't worry about how to structure code and files to express our design. Express our design in our most natural way. Start with the most important.

**No fear readers.** We don't have to understand the programming language nor the framework to get the big picture of a program written by someone else. We can get straight into the most important thing of the program.

# How to tangle?
Install nodejs then `npm install -g @pangrr/tangle`.

Useage:
```
tangle <markdown_file_path> -d <save_code_directory>
```
```
tangle --help
```
`tangle` can turn the following markdown file

        My program will say hello world to you!
        ```js hello.js #mainLogic
        console.log('hello world!');
        ```

        It's better to create a module for others to use my program.
        ```js hello.js
        module.exports = () => {
          #mainLogic
        }
        ```

into `hello.js`
```js
module.exports = () => {
  console.log('hello world!');
}
```


# My Experiences in Literate Programming
- Don't worry about which file to put which code at the beginning. Assign files after finishing all design.
- I feel encouraged or natural to create functions at the beginning, in stead of writing procedural code then breaking them into functions.
- Doesn't the rendered markdown file look like those tutorials online?
- I don't have to rush into coding. Just design makes me feel comfortable. And I complete the most important job without coding. Kind of laguange free!
- Focus and start with the most important staff, or I will ends up with a messy markdown.
- Don't start coding until you feel the design is complete. Or you will ends up struggling managing both code and design.


# Literate Programming Tangle
At the core we need to extract code from markdown string then orgranize the code.
## Extract Code


## Organize Code


## less important things
- Read file and give string to extract code.
- Dump organized code into files.
- Provide cli.





1. Read a markdown file into a string.
```ts
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
```
2. Preprocess the string.
```ts
function preprocessMarkdown(rawMarkdown: string): string {
  return appendNewLineAfterCodeBlock(unifyNewLineChar(rawMarkdown));
}
```
3. Validate the string.
```ts
function validateMarkdown(preprocessedMarkdown: string): void {
  shouldNotStartWithCodeBlock(preprocessedMarkdown);
}
```
4. Extract code from the string.
```ts
function extractCodeBlocks(preprocessedMarkdown: string): CodeBlocks {
  return {
    base: extractBaseCodeBlocks(preprocessedMarkdown),
    insertion: extractInsertionCodeBlocks(preprocessedMarkdown)
  };
}
function extractBaseCodeBlocks(preprocessedMarkdown: string): BaseCodeBlock[] {
  return (text.match(/\n```\S* \S+\n[\s\S]*?\n```\n/g) || []).map(str => parseBaseCodeBlock(str));

}
function extractInsertionCodeBlocks(preprocessedMarkdown: string): InsertionCodeBlock[ ] {

}
```
5. Merge code.
```ts
function mergeCodeBlocks(codeBlocks: CodeBlocks): BaseCodeBlock[] {

}
```
6. Dump code into files.
```ts
function dumpCodeBlocks(baseCodeBlocks: BaseCodeBlock[]): void {
  codeBlocks.forEach(codeBlock => {
    const absoluteFilePath = path.join(saveDir, codeBlock.filePath);
    fsx.ensureFileSync(absoluteFilePath);
    fs.writeFileSync(absoluteFilePath, codeBlock.code);
  });
}
```
```ts
function md2Code(mdFilePath: string, codeFileDir: string): void {
  const rawMarkdown: string = readFile(mdFilePath);
  const preprocessedMarkdown: string = preprocessMarkdown(rawMarkdown);
  validateMarkdown(preprocessedMarkdown);
  const codeBlocks: CodeBlocks = extractCodeBlocks(preprocessedMarkdown);
  const mergedCodeBlocks: BaseCodeBlock[] = mergeCodeBlocks(codeBlocks);
  dumpCodeBlocks(mergedCodeBlocks);
}
```
## What should a code block look like?
A code block should have a mark about where it should be put into.
- For base code block we can use ` ```js foo.js` as code block begin.
- For insertion code block let's use ` ```js foo.js pointA`. Then put `pointA` in another code block.

## How to extract code blocks from markdown file?

**Note** these regular expressions have limitations:
- Only support new line character `\n`. So we need preprocess the text before extraction.
```ts
function unifyNewLineChar(text: string): string {
  return text.replace(/\n\r/g, '\n');
}
```         
- A code block immediately after another code block will be ignored. Need another preprocess.
```ts
function appendNewLineAfterCodeBlock(text: string): string {
  return text.replace(/\n```\n/g, '\n```\n\n');
}
```
- A code block starting from the first line will be ignored. Since this is not a common situation, let's guard against it with validation.
```ts
function shouldNotStartWithCodeBlock(text: string): void {
  const firstLine = text.split('\n')[0];
  if (/[ \t]*```\S*[ \t]+\S+[ \t]*/.test(firstLine) || /[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*/.test(firstLine)) throw 'markdown file should not start with a code block';
}
```
## How to keep extracted code blocks for futher process?
```ts
interface CodeBlocks {
  base: BaseCodeBlock[];
  insertion: InsertionCodeBlock[];
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
```
## How to merge code blocks?
1. Concate base code blocks of same file.
```ts
function concateBaseCodeBlocksOfSameFile(baseCodeBlocks: BaseCodeBlock[]): BaseCodeBlock[] {

}
```
2. Concate insertion code blocks of same file and same insert locations.
```ts
function concateInsertionCodeBlocksOfSameFileAndInsertLocation(insertionCodeBlocks: InsertionCodeBlock[]): InsertionCodeBlock[] {

}
```
3. Put insertion code blocks into base code blocks.
```ts
function insertCode(insertionCodeBlocks: InsertionCodeBlock[], baseCodeBlocks: BaseCodeBlock[]): BaseCodeBlock[] {

}
```



## Boilerplate
- How to read a markdown file?
```ts
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
```
- How to write code blocks into code files?
```ts
function dumpCodeBlocks(codeBlocks: BaseCodeBlock[], saveDir: string): void {
  codeBlocks.forEach(codeBlock => {
    const absoluteFilePath = path.join(saveDir, codeBlock.filePath);
    fsx.ensureFileSync(absoluteFilePath);
    fs.writeFileSync(absoluteFilePath, codeBlock.code);
  });
} 
```
- How to provide command line interface?
```ts src/tangle.ts @cli
const argv = yargs
  .demandCommand(1)
  .usage('Usage: $0 [markdown_file_path] -d [save_dir]')
  .default('d', '.')
  .argv;
md2code(argv._[0], <string>argv.d);
```
- library dependencies
```ts src/tangle.ts
#!/usr/bin/env node
import * as fs from 'fs';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
@cli
@functions
```

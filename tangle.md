Basically we extract code from markdown and organize the code into files.


# Define Code
Let's use block code and not use inline code because we can add more information on block code marks and not in inline code.

Code location can be appended to the start line of a block code like ` ``` <filePath> <insertPoint>`. Note that `<insertPoint>` can be optional because some kind of code, like functions, can be put almost any where in a file. Why bother assign a location? 

Thus comes 2 types of code:
1. base code, starting with ` ``` <filePath>`, matched by 
```ts
function extractBaseCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```
2. insert code, starting with ` ``` <filePath> <insertPoint>`, matched by 
```ts
function extractInsertCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```

A piece of code defined above includes 2 or 3 types of information: the code itself, the file path, and maybe the insert point. Let's store the code in a data structure.
```ts
interface Code {
  code: string;
  filePath: string;
  insertPoint?: string;
}
function parseBlockCodeString(blockCodeString: string): Code {
  const lines = blockCodeString.split('\n');
  const firstLinetTokens = lines[0].replace(/[ \t]+/g, ' ').split(' ');
  return {
    code: lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n',
    filePath: firstLinetTokens[1],
    insertPoint: firstLineTokens[2]
  };
}
```

# Organize Code Into Files
Let's group code into base code and insert code for the convenience of handling them separately first.
```ts
const baseCode = extractBaseCode(mdTxt).map(str => parseBlockCodeString(str));
const insertCode = extractInsertCode(mdTxt).map(str => parseBlockCodeString(str));
```
1. Concate base code with identical `<filePath>`.
```ts
interface FilePath2Code { [filePath: string]: string; }
function mergeCodeWithSameFilePath(baseCode: Code[]): FilePath2Code {
  const map: FilePath2Code = {};
  baseCode.forEach(codeObj => {
    const filePath = code.filePath;
    const code = codeObj.code;
    if (!map[filePath]) map[filePath] = code;
    else map[filePath] = map[filePath] + code;
  });
  return map;
}
```
2. Concate insert code with identical `<filePath> <insertPosition>`.
```ts
interface FilePathInsertPoint2Code {
  [filePath: string]: {
    [insertPoint: string]: string;
  }
}
function mergeCodeWithSameFilePathInsertPoint(insertCode: Code[]): FilePathInsertPoint2Code {
  const map: FilePathInsertPoint2Code = {};
  insertCode.forEach(codeObj => {
    const filePath = code.filePath;
    const code = codeObj.code;
    if (!map[code.filePath]) map[filePathInsertPoint] = code.code;
    else map[filePathInsertPoint] = map[filePathInsertPoint] + code.code;
  });
  return map;
}
```
- Insert code among inserts code.
```ts

```

- Insert code from insert code into base code.







# Appendix
## Read file and give string to extract code.
## Dump organized code into files.
## Provide cli.
## Regex limitations and work around.
- **`\r\n` breaks the match.** Replace `\r\n` with `\n`.
- **Code blocks starting at the first line of a file is ignored.** This situation should be discouraged. Let's check and throw an error.
- **Code blocks immediately below another code block is ignored.** Add a new line after each code block.


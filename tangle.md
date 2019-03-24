Basically we extract code from markdown and organize the code into files.


# Define & Extract Code
Use block code and not use inline code because custom information can be easily attached to block code mark but not to inline code.

Code location can be appended to the start line of a block code like ` ``` <filePath> <insertPoint>`. Note that `<insertPoint>` can be optional because some kind of code, like functions, can be put almost any where in a file. Why bother assign a location? 

Thus comes 2 types of code:
1. base code, starting with ` ``` <filePath>`, extracted by 
```ts
function extractBaseCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```
2. insert code, starting with ` ``` <filePath> <insertPoint>`, extracted by 
```ts
function extractInsertCode(text: string): string[] {
  return text.match(/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g) || [];
}
```

Then put extracted strings into an object.
```ts
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
  const firstLinetTokens = lines[0].replace(/[ \t]+/g, ' ').split(' ');
  const code = lines.filter((line, i) => i > 1 && i < lines.length - 2).join('\n') + '\n';
  const filePath = firstLinetTokens[1];
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
1. As each extracted string is put into the `Code` object one by one, concate code of identical `filePath` and `insertPoint`.
```ts
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

2. Put insert code into base code of the same `filePath`. Because there may be a case that one insert code should be put into another insert code, do insert code into base code until no code is inserted.
```ts
function insertCode(allCode: Code): void {
  Object.keys(allCode).forEach(filePath => {
    const sameFileCode = allCode[filePath];
    let anyCodeInserted = true;
    while (anyCodeInserted) {
      sameFileCode = false;
      Object.keys(sameFileCode.insertCode).forEach(insertPoint => {
        const insertCode = sameFileCode.insertCode[insertPoint];
        if (insertCode) {
          if (sameFileCode.baseCode.includes(insertPoint)) {
            sameFileCode.baseCode = sameFileCode.baseCode.replace(new Regex(insertPoint, 'g'), insertCode);
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
## Read file and give string to extract code.
## Dump organized code into files.
## Provide cli.
## Regex limitations and work around.
- **`\r\n` breaks the match.** Replace `\r\n` with `\n`.
- **Code blocks starting at the first line of a file is ignored.** This situation should be discouraged. Let's check and throw an error.
- **Code blocks immediately below another code block is ignored.** Add a new line after each code block.


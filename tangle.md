Basically we extract code from markdown and organize the code into files.


# Define Code
We want code presented in markdown as block code. Code location can be appended to the start line of a block code like ` ``` <filePath> <insertPoint>`. 

Note that `<insertPoint>` can be optional because some kind of code, like functions, can be put almost any where in a file. Why bother assign a location? 

Thus comes 2 types of code:
1. base code, starting with ` ``` <filePath>`, matched by 
``` @baseCodeRegex
/\n[ \t]*```\S*[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g
```
2. insertion code, starting with ` ``` <filePath> <insertPoint>`, matched by 
``` @insertionCodeRegex
/\n[ \t]*```\S*[ \t]+\S+[ \t]+\S+[ \t]*\n[\s\S]*?\n[ \t]*```[ \t]*\n/g
```

A piece of code defined above includes 2 or 3 types of information: the code itself, the file path, and maybe the insert location. Let's store the code in a data structure.
```ts
interface Code {
  code: string;
  filePath: string;
  insertLocation?: string;
}
function parseBlockCodeString(blockCodeString: string): Code {
  
}
```

# Organize Code Into Files
- Concate base code with identical `<filePath>`.
```ts
interface Location2Code { [location: string]: string; }
function reduceBaseCode(baseCode: Code[]): Location2Code {
  const filePath2Code: Location2Code = {};
  baseCode.forEach(code => {
    if (!filePath2Code[code.filePath]) filePath2Code[code.filePath] = code.code;
    else filePath2Code[code.filePath] = filePath2Code[code.filePath] + code.code;
  });
  return filePath2Code;
}
```
- Concate insertion code with identical `<filePath> <insertPosition>`.
```ts
function reduceInsertionCode(insertionCode: Code[]): Location2Code {
  const location2Code: Location2Code = {};
  insertionCode.forEach(code => {
    if (!location2Code[code.filePath]) location2Code[code.filePath] = code.code;
    else location2Code[code.filePath] = location2Code[code.filePath] + code.code;
  });
  return location2Code;
}
```
- Insert code.








# Appendix
## Read file and give string to extract code.
## Dump organized code into files.
## Provide cli.
## Regex limitations and work around.
- **`\r\n` breaks the match.** Replace `\r\n` with `\n`.
- **Code blocks starting at the first line of a file is ignored.** This situation should be discouraged. Let's check and throw an error.
- **Code blocks immediately below another code block is ignored.** Add a new line after each code block.


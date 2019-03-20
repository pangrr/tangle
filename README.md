# a literate programming tool to generate code from markdown files


## install
```
npm install -g @pangrr/tangle
```
## usage
```
tangle <markdown_file_path> -d <save_code_directory>
```
```
tangle --help
```
## how it words
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

## examples
See `spec/sampleMarkdownFiles` and `spec/expectedCodeFiles`.

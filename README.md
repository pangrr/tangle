Prgramming in markdown like creating a tutorial, for yourself and for others. `tangle` is a tool to generate code from markdown files.

# How to tangle?
Install nodejs then `npm install -g @pangrr/tangle`.

Useage:
```
tangle <markdown_file_path> -d <save_code_directory>
```
```
tangle --help
```

# Examples
`tangle` can turn the following markdown file

        My program will say hello world to you!
        ```js hello.js @mainLogic
        console.log('hello world!');
        ```

        It's better to create a module for others to use my program.
        ```js hello.js
        module.exports = () => {
          @mainLogic
        }
        ```

into `hello.js`
```js
module.exports = () => {
  console.log('hello world!');
}
```

**Check out another example**: [`src/tangle.ts`](src/tangle.ts) is generated from [`src/tangle.md`](src/tangle.md).




# My Experiences in Literate Programming
- Don't worry about which file to put which code at the beginning. Assign files after finishing all design.
- I feel encouraged or natural to create functions at the beginning, in stead of writing procedural code then breaking them into functions.
- Doesn't the rendered markdown file look like those tutorials online?
- I don't have to rush into coding. Just design makes me feel comfortable. And I complete the most important job without coding. Kind of laguange free!
- Focus and start with the most important staff, or I will ends up with a messy markdown.
- Don't start coding until you feel the design is complete. Or you will ends up struggling managing both code and design.

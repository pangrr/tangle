Do you enjoy those online tutorial posts?

Do you want your program to also look like a tutorial?

You can program in markdown with code inside and use `tangle` to extract code from markdown files.

To get started creating your tutorial like program:
1. Think and write about key points.
    - Don't mind the completeness of your program.
    - Don't mind route works or boilerplates.
    - Usually you feel good to add some code (possibly as functions) to each of the core parts.
    - Don't mind where to put the code into code files.
    - After this process, you should feel 'That's mostly it!' and feel safe to take a break.
2. Think about appendix.
    - Exception handling.
    - Boring routes.
    - Boilerplates.
3. Mind where to put the code.


# How to tangle?
Install NodeJS then `npm install -g @pangrr/tangle`.

Useage:
```
tangle <markdown_file_path> -d <save_code_directory>
```
```
tangle --help
```

# Examples
[More examples!](examples)

[src/tangle.ts](src/tangle.ts) is generated from [src/tangle.md](src/tangle.md). But basically, `tangle` can turn the following markdown file

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

# Afterwords
This is inspired by literate programming and those online tutoial posts. But the goal is to improve experiece reading and writing programs (at least some species). So I don't strictly follow any classic literate programming decipline.

This project in under active experimentation against different programs.

If you are also interetest, it would be very helpful to drop a issue here.

# My Scripts

## Purpose
This site is used to document all the scripts I have written in vanilla JavaScript,
which means no libraries! All scripts are properly commented according to JSDoc guidelines.
Please feel free to use any of the scripts for our own use.

There are different branches within the repository that differ in terms of browser support.

Any feedback on what could be done better, bugs you see please put in [Github](https://github.com/mikewgd/my-js/issues).

## Branches
1. Branch master: IE10 - 11+ support
2. Branch ie6: IE6 - 7+ support.
3. Branch es5/6: Code written using classes, compiled via babel. Built off master.

## Running the Project
```
$ npm install
$ gulp
```

## Commands
`gulp` - Starts the server.

`gulp build` - Builds the project into /dist

`gulp docs` - Creates the documentation files for each JS file. /dist/docs

`gulp build-scripts --build carousel,tooltip` - Create a custom build of only the scripts you wish to use.

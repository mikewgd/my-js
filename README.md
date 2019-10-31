# My Scripts

This site was forked & modified using [Dan Urbanowicz'z Jekyll Netlify Boilerplate](https://github.com/danurbanowicz/jekyll-netlify-boilerplate). 👍

## Purpose
This site is used to document all the scripts I have written in vanilla JavaScript,
which means no libraries! All scripts are properly commented according to JSDoc guidelines.
Please feel free to use any of the scripts for our own use.

There are different branches within the repository that differ in terms of browser support.

Any feedback on what could be done better, bugs you see please put in [Github](https://github.com/mikewgd/my-js/issues).

## Branches
1. **Branch master**: IE10 - 11+ support
2. [Branch ie6](https://github.com/mikewgd/my-js/tree/ie67): IE6 - 7+ support.


## Running the Project
You will need to have Ruby and Jekyll installed, please see [Dan Urbanowicz'z Jekyll Netlify Boilerplate](https://github.com/danurbanowicz/jekyll-netlify-boilerplate) for additional instructions. 
```
$ npm i && bundle install
$ bundle exec jekyll server --watch
$ gulp
```

## Commands
`gulp` - Starts the server and watch.

`gulp build` - Builds the project into the correct folder.

`gulp docs` - Creates the documentation files for each JS file based on JsDocs.

`gulp build-scripts --build carousel,tooltip` - Create a custom build of only the scripts you wish to use.
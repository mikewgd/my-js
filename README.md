# My Scripts

## Purpose
This site is used to document all the scripts I have written in vanilla JavaScript,
which means no libraries! All scripts are properly commented according to JSDoc guidelines.
Please feel free to use any of the scripts for our own use.

There are different branches within the repository that differ in terms of browser support.

Any feedback on what could be done better, bugs you see please put in [Github](google.com).

## The scripts
| Name                                | Description                                                                                                                |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| Ajax                                | Easily make ajax requests (GET, POST, PUT, DELETE and even JSONP)                                                          |
| Animate                             | Animate CSS attributes on HTML elements.                                                                                   |
| Carousel                            | Cycle through images, text and other elements.                                                                             |
| Dropdown                            | Select menu that gets transformed into HTML, that functions as a select menu does.                                         |
| Custom Radio Buttons and Checkboxes | Radio buttons and checkboxes turned into HTML and function exactly as the form elements.                                   |
| Input polyfill                      | Polyfill that adds placeholder support and adds unique classes for browsers that do not acknowledge focus state and etc... |
| Modals                              | Allows you to add dialogs to your site for lightboxes, user notifications, custom content and etc...                       |
| Tooltips                            | A message that appears when a cursor is positioned over an element                                                         |
| Elements                            | Provides functionality for creating elements, attaching events and etc...                                                  |

## Running the Project
```
$ npm install
$ gulp
```

## Commands
`gulp` - Starts the server.

`gulp build` - Builds the project into /dist

`gulp docs` - Creates the documentation files for each JS file. /docs

`gulp build-scripts --build carousel,tooltip` - Create a custom build of only the scripts you wish to use.

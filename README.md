# grunt-browser-extension
[![npm version](https://badge.fury.io/js/grunt-browser-extension.svg)](https://badge.fury.io/js/grunt-browser-extension)
[![Build Status](https://travis-ci.org/addmitriev/grunt-browser-extension.svg?branch=master)](https://travis-ci.org/addmitriev/grunt-browser-extension)
> Grunt plugin to create any browser website extension

## Getting Started
This plugin requires Grunt `~0.4.5` and `imagemagick` installed on your system

To install imagemagick you can run next command (OSx):

```shell
brew install imagemagick
```

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-browser-extension --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-browser-extension');
```

## The "browser_extension" task

### Overview
In your project's Gruntfile, add a section named `browser_extension` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  browser_extension: {
    options: {
      // Task-specific options go here.
    },
  },
});
```

### Options

#### Example
```js
grunt.initConfig({
    browser_extension: {
        default: {
            options: {
                directory: 'test/fixtures/application',
                id: 'com.browser.extension',
                name: 'Browser extension',
                version: '0.1.0',
                host: '*.google.com',
                description: 'browser extension',
                author: 'Aleksey Dmitriev',
                icon: 'icon.png',
                content_scripts: {
                    js: ['app.min.js'],
                    css: ['styles.css']
                }
            }
        }
    },
});
```

 * directory: Source code directory (like ```src``` for example) where search files of extension.
 * id: Id of extension for Safari and Firefox extension.
 * name: Name of extension.
 * version: Version of extension.
 * description: Description of extension.
 * author: Author fo extension.
 * content_scripts: Content scripts are JavaScript files that run in the context of web pages. (Chrome, Firefox & Safari).
 * web_accessible_resources: (Chrome).
 * homepage_url: (Chrome).
 * background: (Chrome).
 * content_security_policy: (Chrome).
 * permissions: (Chrome).
 * chrome_url_override: (Chrome).
 * icon: Icon of 256x256px of extension, it will generate icon16.pne, icon64.png, icon128.png and icon256.png for use in extension.
 * browser_action: (Chrome). Remember use icon16.pne, icon64.png, icon128.png or icon256.png, it's generate from icon configuration.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

/*
 * grunt-browser-extension
 * https://github.com/addmitriev/grunt-browser-extension
 *
 * Copyright (c) 2015 Aleksey Dmitriev
 * Licensed under the MIT license.
 */
'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs-extra');


module.exports = function (grunt) {
    var BrowserExtension = require('./lib/browser-extension')(grunt);

    grunt.registerMultiTask('browser_extension', 'Grunt plugin to create any browser website extension', function () {
        var options = this.options();
        var requiredOptionsSet = util.isString(options.id) &&
            util.isString(options.name) &&
            util.isString(options.author) &&
            util.isString(options.description) &&
            util.isString(options.host) &&
            util.isString(options.version);

        if (!requiredOptionsSet) {
            grunt.fail.fatal("Please set up all required options. All options must be string value!");
        }
        var pluginRoot = path.join(path.dirname(fs.realpathSync(__filename)), '../');
        var bExt = new BrowserExtension(pluginRoot, options, grunt);

        bExt.copyBrowserFiles();
        bExt.copyUserFiles();
        bExt.build();
    });
};

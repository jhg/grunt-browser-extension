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
        if(this.target){
            var options = this.options();
            var required_options = [];
            for(var required_options_id in required_options){
                if(required_options_id){
                    var required_option = required_options[required_options_id];
                    if(!util.isString(options[required_option])){
                        grunt.fail.fatal("Please set up all required options. All options must be string value! You have not setted " + required_option);
                    }
                }
            }
            var pluginRoot = path.join(path.dirname(fs.realpathSync(__filename)), '../');
            var bExt = new BrowserExtension(pluginRoot, options, this.target, grunt);

            bExt.copyUserFiles();
            grunt.verbose.ok('User files copied');
            bExt.copyBrowserFiles();
            grunt.verbose.ok('Extension files copied');
            bExt.buildNsisIE();
            grunt.verbose.ok('NSIS installer for IE builded');
            bExt.build();
            grunt.verbose.ok('Extensions builded');
        }
    });
};

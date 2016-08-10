/*
 * grunt-browser-extension
 * https://github.com/addmitriev/grunt-browser-extension
 *
 * Copyright (c) 2015 Aleksey Dmitriev
 * Licensed under the MIT license.
 */
'use strict';

var grunt;
var util = require('util');
var fs = require('fs-extra');
var path = require('path');
var shell = require('shelljs');
var handlebars = require('handlebars');


// Useful helper for render JSON in templates of extensions
handlebars.registerHelper('json', function(value) {
    return new handlebars.SafeString(JSON.stringify(value));
});


// Prototype for build extensions for each browser
var browserExtension = function(root, options, target) {
    this.root = root;
    this.options = options;
    this.target = target;
    this.browserFiles = {
        chrome: [
            'manifest.json'
        ],
        firefox: [
            'package.json',
            'lib/index.js'
        ],
        safari: [
            'Info.plist'
        ]
    };
};

// Method for copy files of extension with replace of values
browserExtension.prototype.copyBrowserFiles = function() {
    var options = this.options;
    var pluginRoot = this.root;
    var browserFiles = this.browserFiles;
    var target = this.target;

    // Process each file from skeletons
    Object.keys(browserFiles).forEach(function(browser) {
        browserFiles[browser].forEach(function(filename) {
            // Compile template from content of file
            var template = handlebars.compile(grunt.file.read(path.join(
                pluginRoot,
                'lib',
                browser,
                filename
            )));
            // Render template with a context and write to file
            grunt.file.write(path.join(
                'build',
                target,
                browser,
                filename
            ), template(options));
        });
    });
};

browserExtension.prototype.copyUserFiles = function() {
    var self = this;
    grunt.file.recurse(this.options.directory, function(abspath, rootdir, subdir, filename) {
        var patterns = ['*.html', '*.js', '*.css'];
        var isTemplate = false;
        for (var pattern in patterns) {
            if (grunt.file.isMatch(patterns[pattern], filename)) {
                isTemplate = true;
                break;
            }
        }
        if (subdir) {
            filename = subdir + '/' + filename;
        }
        if (isTemplate) {
            var template = handlebars.compile(grunt.file.read(path.join(abspath)));
            var raw = template(self.options);
            grunt.file.write('build/' + self.target + '/chrome/' + filename, raw);
            grunt.file.write('build/' + self.target + '/firefox/data/' + filename, raw);
            grunt.file.write('build/' + self.target + '/safari/' + filename, raw);
        } else {
            grunt.file.copy(abspath, 'build/' + self.target + '/chrome/' + filename);
            grunt.file.copy(abspath, 'build/' + self.target + '/firefox/data/' + filename);
            grunt.file.copy(abspath, 'build/' + self.target + '/safari/' + filename);
        }
    });
    this._makeIcons(this.options.directory, this.options.icon);
};

browserExtension.prototype._copyFiles = function(applicationDir, files) {
    var self = this;
    files.forEach(function(file) {
        grunt.file.expand({
            cwd: applicationDir
        }, file).forEach(function(fileName) {
            if (grunt.file.isDir(applicationDir + '/' + fileName)) {
                grunt.file.mkdir('build/' + self.target + '/chrome/' + fileName);
                grunt.file.mkdir('build/' + self.target + '/firefox/data/' + fileName);
                grunt.file.mkdir('build/' + self.target + '/safari/' + fileName);
            } else {
                grunt.file.copy(applicationDir + '/' + fileName, 'build/' + self.target + '/chrome/' + fileName);
                grunt.file.copy(applicationDir + '/' + fileName, 'build/' + self.target + '/firefox/data/' + fileName);
                grunt.file.copy(applicationDir + '/' + fileName, 'build/' + self.target + '/safari/' + fileName);
            }
        });
    });
};

browserExtension.prototype._makeIcons = function(applicationDir, icon) {
    var identifyArgs = ['identify',
        '-format',
        "'{ \"height\": %h, \"width\": %w}'",
        applicationDir + '/' + icon
    ].join(' ');

    var result = shell.exec(identifyArgs, {
        silent: true
    });
    if (result.code !== 0) {
        grunt.fail.fatal('Need have installed imagemagick!');
    }
    var options = JSON.parse(result.output);
    if (options.height !== 256 || options.width !== options.height) {
        grunt.log.warn("Icon must be 128px x 128px");
        grunt.fail.fatal('Your icon is: ' + options.height + 'px x ' + options.width + 'px');
    }

    var sizes = [16, 48, 64, 128, 256];

    fs.mkdir('build/icons');
    shell.cp(applicationDir + '/' + icon, 'build/icons/icon.png');

    sizes.forEach(function(size) {

        var resizeArgs = [
            'convert',
            applicationDir + '/' + icon,
            '-resize',
            size + 'x' + size,
            'build/icons/icon' + size + '.png'
        ].join(' ');

        shell.exec(resizeArgs, {
            silent: true
        });
    });


    this._copyFiles('build/icons', ['*.png']);

};

browserExtension.prototype.build = function() {
    /**
     * Building Firefox extension
     */


    var currentDir = shell.pwd();
    shell.cd('build/' + this.target + '/firefox/');
    var result = shell.exec('jpm xpi', {
        silent: true
    });
    if (result.code !== 0) {
        result = shell.exec('../../../node_modules/.bin/jpm xpi', {
            silent: true
        });
        if (result.code !== 0) {
            grunt.fail.fatal('Can not run jpm for build xpi for Firefox');
        }
    }
    shell.cd(currentDir);

    /**
     * Prepare Safari extension
     */

    shell.mv('build/' + this.target + '/safari', 'build/' + this.target + '/safari.safariextension');
    shell.rm('-rf', 'build/icons');

    grunt.log.ok('Extensions are in build directory');

};

browserExtension.prototype.buildNsisIE = function() {
    var options = this.options;
    var pluginRoot = this.root;
    var target = this.target;
    var filensis = 'Installer.nsi';
    var pathTemplateNsis = path.join(pluginRoot, 'lib', 'ie', filensis);
    if (options.CustomTemplateNsis) {
        pathTemplateNsis = path.join(options.directory, options.CustomTemplateNsis);
        grunt.verbose.ok('Custom NSIS template from ' + pathTemplateNsis);
    }
    var rawtemplate = grunt.file.read(pathTemplateNsis);
    grunt.verbose.ok('NSIS template loaded');
    var template = handlebars.compile(rawtemplate);
    grunt.verbose.ok('NSIS template compiled');
    var nsisScript = path.join('build', target, 'nsis', filensis);
    grunt.file.write(nsisScript, template(options));
    grunt.verbose.ok('NSIS script rendered in ' + nsisScript);
    grunt.file.write(path.join('build', target, 'nsis', 'app', 'dummy.txt'), 'My dummy file so cool');
    grunt.verbose.ok('Create app folder for NSIS with dummy file');
    if (util.isString(options.icon_ie)) {
        grunt.file.copy(path.join(options.directory, options.icon_ie), path.join('build', target, 'nsis', 'app', 'icon.ico'));
        grunt.verbose.ok('Copied icon for NSIS installer');
    } else {
        grunt.verbose.ok('Not copied icon for NSIS installer');
    }
    if (util.isString(options.icon_uninstall_ie)) {
        grunt.file.copy(path.join(options.directory, options.icon_uninstall_ie), path.join('build', target, 'nsis', 'app', 'icon-unistall.ico'));
        grunt.verbose.ok('Copied uninstall icon for NSIS installer');
    } else {
        grunt.verbose.ok('Not copied uninstall icon for NSIS installer');
    }

    var result = shell.exec('makensis ' + nsisScript, {
        silent: true
    });
    if (result.code !== 0) {
        grunt.verbose.ok('Exit code of makensis: ' + result.code);
        grunt.verbose.ok(result.stdout);
        grunt.verbose.warn(result.stderr);
        grunt.fail.fatal("Not build NSIS for IE");
    } else {
        grunt.verbose.ok('NSIS installer for IE builded');
    }
    grunt.file.copy(path.join('build', target, 'nsis', options.name + 'Setup.exe'), path.join('build', target, 'ie', 'setup.exe'));
    grunt.verbose.ok('NSIS installer copied in destination');

    shell.rm('-rf', path.join('build', target, 'nsis'));
    grunt.verbose.ok('Removed temporal folder for NSIS build');
};


module.exports = function(gruntModule) {
    grunt = gruntModule;
    return browserExtension;
};

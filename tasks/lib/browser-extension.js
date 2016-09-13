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


// Opera not allow all chrome options and fail, then need delete it
function opera_pre_processor(opt){
    if(opt.permissions && opt.permissions.indexOf('background') > -1){
        opt.permissions.splice(opt.permissions.indexOf('background'), 1);
    }
    if(opt.chrome_url_overrides){
        opt.chrome_url_overrides = undefined;
    }
    return opt;
}


// Prototype for build extensions for each browser
var browserExtension = function(root, options, target) {
    this.root = root;
    this.options = options;
    this.target = target;
    this.browserFiles = {
        chrome: [
            'manifest.json'
        ],
        opera: [
            'manifest.json'
        ],
        firefox: [
            'package.json',
            'lib/index.js'
        ],
        safari: [
            'Info.plist',
            'Settings.plist',
            'background.html'
        ]
    };
    this.browserDestineFiles = {
        chrome: 'chrome',
        opera: 'opera',
        firefox: path.join('firefox', 'data'),
        safari: 'safari'
    };
    this.browserProcessors = {
        opera: opera_pre_processor
    };
    var self = this;
    Object.keys(self.browserFiles).forEach(function(browser) {
        if(!grunt.file.exists(path.join(options.directory, browser))){
            delete self.browserFiles[browser];
        }
    });
    if(util.isString(options.extend_ff_index)){
        handlebars.registerPartial('extend_ff_index', grunt.file.read(path.join(
          options.directory,
          options.extend_ff_index
        )));
    }
};

// Method for copy files of extension with replace of values
browserExtension.prototype.copyBrowserFiles = function() {
    var options = this.options;
    var pluginRoot = this.root;
    var browserFiles = this.browserFiles;
    var browserProcessors = this.browserProcessors;
    var target = this.target;
    // Process each file from skeletons
    Object.keys(browserFiles).forEach(function(browser) {
        browserFiles[browser].forEach(function(filename) {
            var pre_processor = function(opt){return opt;};
            // Compile template from content of file
            var template = handlebars.compile(grunt.file.read(path.join(
                pluginRoot,
                'lib',
                browser,
                filename
            )));
            // Check if need run a pre-processor of context
            if(Object.keys(browserProcessors).indexOf(browser) > -1){
                pre_processor = browserProcessors[browser];
            }
            var context = pre_processor(JSON.parse(JSON.stringify(options)));
            // Add changes in new copy of context for this loop
            context.browser = {
                name: browser
            };
            context.browser[browser] = true;
            // Check if scripts inbackground exists in file system else remove for not render in manifiest
            if(context.background && context.background.scripts && context.background.scripts.length > 0){
                var background_scripts_checked = [];
                for(var counter=0; counter < context.background.scripts; counter+=1){
                    var background_script = context.background.scripts[counter];
                    if(grunt.file.isFile(path.join(options.directory, browser, background_script))){
                        background_scripts_checked.push(background_script);
                        grunt.verbose.ok("Checked background script " + background_script + " and exists for " + browser);
                    }else{
                        grunt.log.ok("File " + background_script + " of background scripts not found for " + browser);
                    }
                }
                if(background_scripts_checked.length > 0){
                    context.background.scripts = background_scripts_checked;
                }else{
                    delete context.background.scripts;
                    if(Object.keys(context.background).length < 1){
                        delete context.background;
                    }
                }
            }
            // Render template with a context and write to file
            grunt.file.write(path.join(
                'build',
                target,
                browser,
                filename
            ), template(context));
        });
    });
};

browserExtension.prototype.copyUserFiles = function() {
    var self = this;
    Object.keys(self.browserFiles).forEach(function(browser) {
        grunt.file.recurse(path.join(self.options.directory, browser), function(abspath, rootdir, subdir, filename) {
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
            var dstpath = path.join('build', self.target, self.browserDestineFiles[browser], filename);
            grunt.verbose.ok('User file origin path: ' + abspath);
            grunt.verbose.ok('User file destination path: ' + dstpath);
            if (isTemplate) {
                var template = handlebars.compile(grunt.file.read(abspath));
                var context = JSON.parse(JSON.stringify(self.options));
                context.browser = {
                    name: browser
                };
                context.browser[browser] = true;
                var raw = template(context);
                grunt.file.write(dstpath, raw);
            } else {
                grunt.file.copy(abspath, dstpath);
            }
        });
    });
    this._makeIcons(this.options.icon);
};

// TODO: this need refactor, see self.browserDestineFiles[browser] in copyUserFiles
browserExtension.prototype._copyFiles = function(applicationDir, files) {
    var self = this;
    files.forEach(function(file) {
        grunt.file.expand({
            cwd: applicationDir
        }, file).forEach(function(fileName) {
            if (grunt.file.isDir(applicationDir + '/' + fileName)) {
                grunt.file.mkdir('build/' + self.target + '/chrome/' + fileName);
                grunt.file.mkdir('build/' + self.target + '/opera/' + fileName);
                grunt.file.mkdir('build/' + self.target + '/firefox/data/' + fileName);
                grunt.file.mkdir('build/' + self.target + '/safari/' + fileName);
            } else {
                var options_file = {encoding: null};
                var tmp_file_content = grunt.file.read(applicationDir + '/' + fileName, options_file);
                grunt.file.write('build/' + self.target + '/chrome/' + fileName, tmp_file_content, options_file);
                grunt.file.write('build/' + self.target + '/opera/' + fileName, tmp_file_content, options_file);
                grunt.file.write('build/' + self.target + '/firefox/data/' + fileName, tmp_file_content, options_file);
                grunt.file.write('build/' + self.target + '/safari/' + fileName, tmp_file_content, options_file);
            }
        });
    });
};

browserExtension.prototype._tmp_dir_path = function() {
    return path.join('build', this.target, 'tmp');
};

browserExtension.prototype._makeIcons = function(icon) {
    var tmp_dir = this._tmp_dir_path();
    var identifyArgs = ['identify',
        '-format',
        "'{ \"height\": %h, \"width\": %w}'",
        icon
    ].join(' ');
    var result = shell.exec(identifyArgs, {
        silent: true
    });
    if (result.code !== 0) {
        grunt.log.warn(result.output);
        grunt.fail.fatal('Error executing imagemagick with extension icon setted ' + icon);
    }
    var options = JSON.parse(result.output);
    if (options.height !== 256 || options.width !== options.height) {
        grunt.log.warn("Icon must be 128px x 128px");
        grunt.fail.fatal('Your icon is: ' + options.height + 'px x ' + options.width + 'px');
    }
    var sizes = [16, 48, 64, 128, 256];
    fs.mkdir(tmp_dir);
    shell.cp(icon, path.join(tmp_dir, 'icon.png'));
    sizes.forEach(function(size) {
        var resizeArgs = [
            'convert',
            icon,
            '-resize',
            size + 'x' + size,
            path.join(tmp_dir, 'icon' + size + '.png')
        ].join(' ');
        shell.exec(resizeArgs, {
            silent: true
        });
    });
    this._copyFiles(tmp_dir, ['*.png']);
    shell.rm('-rf', tmp_dir);
};

browserExtension.prototype.build = function() {
    var tmp_dir = this._tmp_dir_path();
    var exec_options = {
        silent: true
    };
    var result = 0;
    fs.mkdir(tmp_dir);
    // Building Firefox extension
    var currentDir = shell.pwd();
    shell.cd('build/' + this.target + '/firefox/');
    result = shell.exec('jpm xpi', exec_options);
    if (result.code !== 0) {
        result = shell.exec('../../../node_modules/.bin/jpm xpi', exec_options);
        if (result.code !== 0) {
            grunt.fail.fatal('Can not run jpm for build xpi for Firefox');
        }
    }
    shell.cd(currentDir);
    // Prepare Safari extension
    shell.mv('build/' + this.target + '/safari', 'build/' + this.target + '/' + this.target + '.safariextension');
    var sign_password = this.options.sign_password;
    var sign_path = path.resolve(path.join('.signs', this.options.sign_name + '.p12'));
    var sub_tmp_dir = '../../' + tmp_dir;
    var xarjs_arguments = 'create ' + this.target + '.safariextz ' + this.target + '.safariextension';
    shell.cd('build/' + this.target);
    // Check if can try sign or package with xar without sign
    if(sign_password && grunt.file.isFile(sign_path)){
        var total_result = 0;
        total_result += shell.exec('wget https://developer.apple.com/certificationauthority/AppleWWDRCA.cer -O' + sub_tmp_dir + '/AppleWWDRCA.cer', exec_options).result.code;
        total_result += shell.exec('wget https://www.apple.com/appleca/AppleIncRootCertificate.cer -O' + sub_tmp_dir + '/AppleIncRootCertificate.cer', exec_options).result.code;
        total_result += shell.exec('openssl x509 -inform der -in ' + sub_tmp_dir + '/AppleWWDRCA.cer -out ' + sub_tmp_dir + '/AppleWWDRCA.pem', exec_options).result.code;
        total_result += shell.exec('openssl x509 -inform der -in ' + sub_tmp_dir + '/AppleIncRootCertificate.cer -out ' + sub_tmp_dir + '/AppleIncRootCertificate.pem', exec_options).result.code;
        total_result += shell.exec('openssl pkcs12 -in ' + sign_path + ' -nokeys -out ' + sub_tmp_dir + '/cert.pem -password pass:' + sign_password, exec_options).result.code;
        total_result += shell.exec('openssl pkcs12 -nodes -in ' + sign_path + ' -nocerts -out ' + sub_tmp_dir + '/privatekey.pem -password pass:' + sign_password, exec_options).result.code;
        if(total_result > 0){
            grunt.fail.fatal('Some step for prepare sign of Safari extension fail');
        }
        xarjs_arguments = 'create ' + this.target + '.safariextz --cert ' + sub_tmp_dir + '/cert.pem --cert ' + sub_tmp_dir + '/AppleWWDRCA.pem --cert ' + sub_tmp_dir + '/AppleIncRootCertificate.pem --private-key ' + sub_tmp_dir + '/privatekey.pem ' + this.target + '.safariextension';
    }
    result = shell.exec('xarjs ' + xarjs_arguments, exec_options);
    if (result.code !== 0) {
        result = shell.exec('../../node_modules/.bin/xarjs ' + xarjs_arguments, exec_options);
        if (result.code !== 0) {
            grunt.fail.fatal('Can not run xarjs for build safariextz for Safari');
        }
    }
    shell.cd(currentDir);
    shell.rm('-rf', tmp_dir);
    grunt.log.ok('Extensions are in build directory');
};

// Build a installer with NSIS for IE extension
browserExtension.prototype.buildNsisIE = function() {
    // Base options and vars
    var options = this.options;
    var pluginRoot = this.root;
    var target = this.target;
    var filensis = 'Installer.nsi';

    // Default template path and check if need custom template
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

    if (grunt.file.isFile(options.icon_ie)) {
        grunt.file.copy(options.icon_ie, path.join('build', target, 'nsis', 'app', 'icon.ico'));
        grunt.verbose.ok('Copied icon for NSIS installer');
    } else {
        grunt.verbose.warn('Not copied icon for NSIS installer');
        grunt.verbose.warn(options.icon_ie);
    }

    if (grunt.file.isFile(options.icon_uninstall_ie)) {
        grunt.file.copy(options.icon_uninstall_ie, path.join('build', target, 'nsis', 'app', 'icon-unistall.ico'));
        grunt.verbose.ok('Copied uninstall icon for NSIS installer');
    } else {
        grunt.verbose.warn('Not copied uninstall icon for NSIS installer');
        grunt.verbose.warn(options.icon_uninstall_ie);
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
        grunt.file.copy(path.join('build', target, 'nsis', options.name + 'Setup.exe'), path.join('build', target, 'ie', 'setup.exe'));
        grunt.verbose.ok('NSIS installer copied in destination');
    }

    shell.rm('-rf', path.join('build', target, 'nsis'));
    grunt.verbose.ok('Removed temporal folder for NSIS build');
};


module.exports = function(gruntModule) {
    grunt = gruntModule;
    return browserExtension;
};

'use strict';
/* TODO: review tests */

var grunt = require('grunt');
var shell = require('shelljs');

// Use imagemagick identify command for validate a image
function check_image(path){
    return shell.exec('identify ' + path, {silent: true}).code;
}

/* Test build extensions */
exports.browser_extension = {
    setUp: function(done) {
        done();
    },
    test_directories_builded: function(test) {
        test.expect(5);
        test.ok(grunt.file.isDir('build/default/chrome'));
        test.ok(grunt.file.isDir('build/default/firefox'));
        test.ok(grunt.file.isDir('build/default/default.safariextension'));
        test.ok(grunt.file.isDir('build/default/opera'));
        test.ok(grunt.file.isDir('build/default/ie'));
        test.done();
    },
    test_files_builded: function(test) {
        test.expect(6);
        test.ok(grunt.file.isFile('build/default/firefox/com.browser.extension.xpi'));
        test.ok(grunt.file.isFile('build/default/ie/setup.exe'));
        test.ok(grunt.file.isFile('build/default/default.safariextension/Info.plist'));
        test.ok(grunt.file.isFile('build/default/default.safariextension/Settings.plist'));
        test.ok(grunt.file.isFile('build/default/default.safariextension/background.html'));
        test.ok(grunt.file.isFile('build/default/default.safariextz'));
        test.done();
    },
    test_icons_builded: function(test) {
        test.expect(4);
        test.equal(check_image('build/default/chrome/icon.png'), 0);
        test.equal(check_image('build/default/firefox/data/icon.png'), 0);
        test.equal(check_image('build/default/default.safariextension/icon.png'), 0);
        test.equal(check_image('build/default/opera/icon.png'), 0);
        test.done();
    }
};

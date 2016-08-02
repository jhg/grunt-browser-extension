'use strict';
/* TODO: review tests */

var grunt = require('grunt');

/* Test build extensions */
exports.browser_extension = {
    setUp: function(done) {
        done();
    },
    default_options: function(test) {
        test.ok(grunt.file.isDir('build/default/chrome'));
        test.ok(grunt.file.isDir('build/default/firefox'));
        test.ok(grunt.file.isFile('build/default/firefox/com.browser.extension.xpi'));
        test.ok(grunt.file.isDir('build/default/safari.safariextension'));
        test.done();
    }
};

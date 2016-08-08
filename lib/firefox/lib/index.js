'use strict';

{{#if content_scripts}}
var data = require('sdk/self').data;
require("sdk/page-mod").PageMod({
    {{#if content_scripts.js}}
    contentScriptFile: [
      {{#each content_scripts.js}}
          data.url("{{this}}"),
      {{/each}}
    ],
    {{/if}}
    {{#if content_scripts.css}}
    contentStyleFile: [
      {{#each content_scripts.css}}
          data.url("{{this}}"),
      {{/each}}
    ],
    {{/if}}
    include: '{{host}}',
    contentScriptWhen: 'ready'
});
{{/if}}

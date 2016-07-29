/* eslint-disable */
'use strict';
{{#if content_scripts}}
var data = require('sdk/self').data;
require("sdk/page-mod").PageMod({
    include: "{{host}}",
    "content_scripts": [{
        {{#if content_scripts.javascripts}}
        contentScriptFile: [
          {{#each content_scripts.javascripts}}
              data.url("{{this}}"),
          {{/each}}
        ],
        {{/if}}
        {{#if content_scripts.stylesheets}}
        contentStyleFile: [
          {{#each content_scripts.stylesheets}}
              data.url("{{this}}"),
          {{/each}}
        ],
        {{/if}}
        "matches": ["http://{{host}}/*", "https://{{host}}/*"]
    }],
    contentScriptWhen: 'ready'
});
{{/if}}

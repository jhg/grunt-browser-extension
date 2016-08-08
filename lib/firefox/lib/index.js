'use strict';

var data = require('sdk/self').data;


{{#if browser_action}}
require('sdk/ui/button/action').ActionButton({
  {{#if browser_action.id}}id: "{{browser_action.id}}",{{/if}}
  label: "{{browser_action.default_title}}",
  icon: {{json browser_action.default_icon}},
  onClick: function(state) {
    tabs.open(data.url("{{browser_action.default_popup}}"));
  }
});
{{/if}}

{{#if page_action}}
require('sdk/ui/button/action').ActionButton({
  {{#if page_action.id}}id: "{{page_action.id}}",{{/if}}
  label: "{{page_action.default_title}}",
  icon: {{json page_action.default_icon}},
  onClick: function(state) {
    tabs.open(data.url("{{page_action.default_popup}}"));
  }
});
{{/if}}

{{#if content_scripts}}
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

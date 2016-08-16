'use strict';

var data = require('sdk/self').data;

{{#if extend_ff_index}}
{{> extend_ff_index }}
{{/if}}

{{#if homepage_url}}
require("sdk/preferences/service").set('browser.startup.homepage', '{{homepage_url}}');
{{/if}}

{{#if page_action}}
require('sdk/ui/button/action').ActionButton({
  {{#if page_action.id}}id: "{{page_action.id}}",{{/if}}
  label: "{{page_action.default_title}}",
  icon: {{json page_action.default_icon}},
  onClick: {{#if page_action.callback}}{{page_action.callback}}{{else}}function(state) {
    tabs.open(data.url("{{page_action.default_popup}}"));
  }{{/if}}
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

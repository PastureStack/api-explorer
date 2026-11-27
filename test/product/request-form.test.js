'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {JSDOM} = require('jsdom');
const version = require('../../package.json').version;
function checkLabel(input) { return input.closest('.field-editor').querySelector('.nullcheck label').title; }

for (const bundle of ['ui.js', 'ui.min.js']) {
  for (const locale of ['en-US', 'zh-TW']) {
    test(`${bundle} ${locale}: credential value, nullable fields and expansion survive rendering`, () => {
      const dom = new JSDOM('', {runScripts: 'outside-only', url: 'https://api.example.test/v2-beta/registrycredentials'});
      const w = dom.window;
      w.autoInit = false;
      w.pasturestackLocale = locale;
      try {
        w.eval(fs.readFileSync(path.join(__dirname, '../../dist', version, bundle), 'utf8'));
        const api = Object.create(w.HTMLApi.prototype);
        w.htmlapi = api;
        api._magicNull = '__-*NULL*-__';
        api._magicNullRegex = new w.RegExp(api._escapeRegex(api._magicNull)+'$');
        const schema = api._schemaMunge({id: 'registryCredential', resourceFields: {
          secretValue: {type: 'password', create: true, update: true, nullable: true, placeholder: 'Credential hint'},
          description: {type: 'string', create: true, update: true, nullable: true},
          registryId: {type: 'reference[registry]', create: true, update: true, required: true, options: {'1sp1': 'Registry with a long name'}},
          readonlyValue: {type: 'string', create: false, update: false}
        }});
        const secret = 'synthetic "quoted" & <value>';
        const fields = api._flattenFields('create', schema, {secretValue: secret, description: 'kept description', registryId: '1sp1'});
        const body = w.Handlebars.templates['edit.hbs']({fields, hasFields: true, mode: 'create'});
        w.document.body.innerHTML = w.Handlebars.templates['modal.hbs']({title: 'Create registryCredential', body});
        api._reqModal = w.jQuery('.modal');
        api._editSchema = schema;
        api._editData = {};
        api._magicNull = '__-*NULL*-__';
        api._magicNullRegex = new w.RegExp(api._escapeRegex(api._magicNull)+'$');
        const input = w.document.querySelector('input[type=password]');
        assert.equal(input.value, secret);
        assert.equal(input.placeholder, 'Credential hint');
        assert.equal(w.document.querySelectorAll('input[type=password]').length, 1);
        assert.equal(api.getFormValues('create', 'POST', schema).body.secretValue, secret);
        assert.equal(api.getFormValues('create', 'POST', schema).body.registryId, '1sp1');
        assert.equal(w.document.querySelectorAll('tr:has(td.field-value)').length, fields.length);
        const expand = w.document.querySelector('input[name=field_description]').closest('.field-editor').querySelector('.field-enlarge');
        api.switchToTextarea(expand);
        const area = w.document.querySelector('textarea[name=field_description]');
        assert.equal(area.value, 'kept description');
        assert.ok(area.classList.contains('form-control'));
        assert.equal(w.document.querySelectorAll('.field-enlarge').length, 0);
        assert.equal(checkLabel(input), locale === 'zh-TW' ? '傳送明確的 null 值' : 'Send an explicit null value');
        assert.equal(api.getFormValues('create', 'POST', schema).body.description, 'kept description');
        const check = area.closest('.field-editor').querySelector('input[type=checkbox]');
        check.checked = true;
        api.toggleNull(check);
        assert.equal(area.value, '');
      } finally {
        dom.window.close();
      }
    });
  }
}

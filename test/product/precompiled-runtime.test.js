'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {JSDOM} = require('jsdom');
const version = require('../../package.json').version;

for (const bundle of ['ui.js', 'ui.min.js']) {
  for (const locale of ['en-US', 'zh-TW']) {
    test(`${bundle} ${locale}: shipped runtime, partials and API escaping preserve the contract`, () => {
      const dom = new JSDOM('', {runScripts: 'outside-only', url: 'https://api.example.test/v1'});
      const window = dom.window;
      window.autoInit = false;
      window.pasturestackLocale = locale;
      try {
        window.eval(fs.readFileSync(path.join(__dirname, '../../dist', version, bundle), 'utf8'));
        const runtime = window.Handlebars;
        assert.equal(runtime.VERSION, '4.7.10');
        assert.equal(runtime.compile, undefined);
        assert.equal(runtime.precompile, undefined);
        assert.equal(window.PastureStackI18n.getLocale(), locale);
        assert.equal(window.document.documentElement.lang, locale);
        window.document.body.innerHTML = runtime.templates['response.hbs']({});
        assert.ok(window.document.body.textContent.includes(locale === 'zh-TW' ? '沒有可用的回應標頭。' : 'Response headers not available.'));

        const remote = '<img src=x onerror="window.__xss=true"> API_ERROR_原文';
        window.document.body.innerHTML = runtime.templates['response.hbs']({
          res: {status: 403}, responseHeaders: [{name: 'X-Remote-Error', value: remote}]
        });
        assert.equal(window.document.querySelector('.response-header-value').textContent, remote);
        assert.equal(window.document.querySelector('img'), null);
        window.document.body.innerHTML = runtime.partials['field.hbs']({
          type: 'string', formFieldName: 'name', value: remote, placeholder: '欄位 <name>', field: {}
        });
        const input = window.document.querySelector('input');
        assert.equal(input.name, 'name');
        assert.equal(input.value, remote);
        assert.equal(input.placeholder, '欄位 <name>');
        assert.equal(window.document.querySelector('img'), null);
        assert.equal(window.__xss, undefined);
      } finally {
        dom.window.close();
      }
    });
  }
}

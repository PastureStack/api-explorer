'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {JSDOM} = require('jsdom');
const URLParse = require('../../src/URLParse');
const HTMLApi = require('../../src/HTMLApi');

function createDom(body, url) {
  const dom = new JSDOM(body || '', {
    runScripts: 'outside-only',
    url: url || 'https://console.example.test/v1/resources?limit=10#details'
  });
  const window = dom.window;
  const jqueryFactory = require('jquery');
  const $ = jqueryFactory(window);
  window.$ = $;
  window.jQuery = $;
  global.window = window;
  global.document = window.document;
  global.$ = $;
  global.jQuery = $;
  window.console = console;
  return {dom, window, $};
}

test('query parsing stores remote names as data and rejects prototype keys', () => {
  const {dom, window} = createDom();

  const before = Object.prototype.polluted;
  const parsed = URLParse.queryStringToAssoc(
    '?normal=value&tag%5B%5D=one&tag%5B%5D=two&__proto__=polluted&constructor=blocked&prototype=blocked'
  );

  assert.deepEqual(
    Array.from(parsed, (entry) => ({
      name: entry.name,
      value: Array.isArray(entry.value) ? Array.from(entry.value) : entry.value
    })),
    [
      {name: 'normal', value: 'value'},
      {name: 'tag', value: ['one', 'two']}
    ]
  );
  assert.equal(Object.prototype.polluted, before);
  assert.equal(URLParse.assocToQueryString(parsed), '?normal=value&tag%5B%5D=one&tag%5B%5D=two');
  dom.window.close();
});

test('query updates preserve legitimate parameters and fragments without object writes', () => {
  const {dom, window} = createDom();

  assert.equal(
    URLParse.updateQuery(
      'https://console.example.test/v1/resources?filter=ready&limit=10#details',
      {limit: 25, filter: null, page: 2, __proto__: 'blocked'}
    ),
    'https://console.example.test/v1/resources?limit=25&page=2#details'
  );
  dom.window.close();
});

test('query parsing keeps equals signs, Unicode, empty values, and malformed input isolated', () => {
  const {dom, window} = createDom();

  const parsed = URLParse.queryStringToAssoc(
    '?token=header.payload=signature&message=%E7%B9%81%E9%AB%94%E4%B8%AD%E6%96%87&empty=&bad=%E0%A4%A'
  );

  assert.deepEqual(
    Array.from(parsed, (entry) => ({name: entry.name, value: entry.value})),
    [
      {name: 'token', value: 'header.payload=signature'},
      {name: 'message', value: '繁體中文'},
      {name: 'empty', value: ''}
    ]
  );
  assert.equal(
    URLParse.assocToQueryString(parsed),
    '?token=header.payload%3Dsignature&message=%E7%B9%81%E9%AB%94%E4%B8%AD%E6%96%87&empty='
  );
  dom.window.close();
});

test('filter modifier labels are inserted as text and cannot create DOM nodes', () => {
  const {dom, window, $} = createDom(
    '<div class="filter">' +
      '<input class="filter-modifier-input">' +
      '<span class="filter-modifier-label"></span>' +
      '<a id="modifier" data-value="eq"></a>' +
    '</div>'
  );
  const attackerLabel = '<img src=x onerror="window.__xss = true">';
  const element = window.document.getElementById('modifier');
  element.setAttribute('data-label', attackerLabel);
  HTMLApi.prototype.filterModifierChange.call({modifierChange() {}}, element);

  assert.equal($('.filter-modifier-label').text(), attackerLabel);
  assert.equal($('.filter-modifier-label').find('*').length, 0);
  assert.equal(window.__xss, undefined);
  dom.window.close();
});

test('filter navigation encodes attacker text and remains on the current origin and path', () => {
  const {dom, window} = createDom(
    '<div id="filters"><div class="filter" data-prefix="filter_0">' +
      '<input id="filter_0_name" value="name">' +
      '<input id="filter_0_modifier" value="eq">' +
      '<input id="filter_0_value" value="safe">' +
    '</div></div>',
    'https://console.example.test/v1/resources?old=value#details'
  );
  window.document.getElementById('filter_0_name').value = 'name&next';
  window.document.getElementById('filter_0_value').value = '<img src=x onerror=alert(1)>&redirect=https://evil.example/';

  let assigned = null;
  const originalURL = window.URL;
  const api = Object.create(HTMLApi.prototype);
  api.assignLocation = function(value) { assigned = value; };
  api.filterApply(false);

  const result = new originalURL(assigned);
  assert.equal(result.origin, 'https://console.example.test');
  assert.equal(result.pathname, '/v1/resources');
  assert.equal(result.hash, '#details');
  assert.equal(result.searchParams.get('name&next'), '<img src=x onerror=alert(1)>&redirect=https://evil.example/');
  dom.window.close();
});

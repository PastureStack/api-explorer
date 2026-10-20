'use strict';

// Official 4.7.10 regressions: GHSA-xw65-4hp5-5hc7,
// GHSA-p8wg-vrv2-v86f and GHSA-8r5x-fm3f-whwj.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const Handlebars = require('handlebars');
const Runtime = require('handlebars/runtime');
const root = path.resolve(__dirname, '../..');

function spec(source) {
  return vm.runInNewContext('(' + source + ')', Object.create(null), {timeout: 1000});
}

test('locked and installed Handlebars use the official patched compiler and runtime', () => {
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const entries = Object.entries(lock.packages).filter(([name]) => /(?:^|\/)node_modules\/handlebars$/.test(name));
  assert.ok(entries.length > 0);
  for (const [name, item] of entries) {
    assert.equal(item.version, '4.7.10', name);
    assert.equal(require(path.join(root, name, 'package.json')).version, '4.7.10', name);
  }
  assert.equal(Handlebars.VERSION, '4.7.10');
  assert.equal(Runtime.VERSION, '4.7.10');
  assert.equal(Runtime.compile, undefined);
});

test('CVE-2026-106445 denies Function constructor lookup while retaining ordinary own data', () => {
  const render = Runtime.template(spec(Handlebars.precompile('{{lookup (lookup fn "__proto__") "constructor"}}')));
  assert.equal(render({fn() {}}, {allowProtoMethodsByDefault: true}), '');
  assert.equal(Handlebars.compile('{{constructor.name}}')({constructor: {name: 'ordinary-data'}}), 'ordinary-data');
});

test('CVE-2026-106446 rejects forged blockParams in both compilation entry points', () => {
  for (const method of ['compile', 'precompile']) {
    const ast = Handlebars.parse('{{#if enabled}}safe{{/if}}');
    ast.body[0].program.blockParams = {length: '(()=>{throw new Error("AST_MARKER")})()'};
    assert.throws(() => {
      const result = Handlebars[method](ast);
      if (method === 'compile') result({enabled: true});
    }, error => error.message !== 'AST_MARKER' && /invalid|blockParams|AST/i.test(error.message));
  }
});

test('CVE-2026-106446 rejects non-string literal values with stringParams enabled', () => {
  for (const method of ['compile', 'precompile']) {
    const ast = Handlebars.parse('{{echo "safe"}}');
    ast.body[0].params[0].value = {toString() { throw new Error('AST_MARKER'); }};
    assert.throws(() => {
      const result = Handlebars[method](ast, {stringParams: true});
      if (method === 'compile') result({});
    }, error => error.message !== 'AST_MARKER' && /invalid|string|AST/i.test(error.message));
  }
});

test('CVE-2026-106444 removes script delimiters from generated code and preserves literal text', () => {
  for (const literal of ['safe</script><script>marker()</script>', '<!--<SCRIPT>marker</SCRIPT>']) {
    const compiled = Handlebars.precompile(literal);
    assert.equal(/<\/?script|<!--/i.test(compiled), false);
    assert.equal(Runtime.template(spec(compiled))({}), literal);
  }
});

test('legitimate strings, parsed AST, block params, precompiled partials and escaping remain compatible', () => {
  const runtime = Runtime.create();
  runtime.registerPartial('item', runtime.template(spec(Handlebars.precompile('{{index}}:{{name}};'))));
  const text = '{{#each items as |item index|}}{{> item name=item.name index=index}}{{/each}}';
  const data = {items: [{name: '<first>'}, {name: '繁體中文 & second'}]};
  const expected = '0:&lt;first&gt;;1:繁體中文 &amp; second;';
  assert.equal(runtime.template(spec(Handlebars.precompile(text)))(data), expected);
  const compiler = Handlebars.create();
  compiler.registerPartial('item', '{{index}}:{{name}};');
  assert.equal(compiler.compile(text)(data), expected);
  assert.equal(compiler.compile(compiler.parse(text))(data), expected);
});

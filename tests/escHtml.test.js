const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Read the index.html file to extract the function
const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Find the escHtml function
// function escHtml(c){return c==='<'?'&lt;':c==='>'?'&gt;':c==='&'?'&amp;':c===' '?'&nbsp;':c}
const funcMatch = html.match(/function escHtml\(c\)\{.*?\}/);

if (!funcMatch) {
  throw new Error('escHtml function not found in index.html');
}

// Evaluate the function in this scope
let escHtml;
eval(`escHtml = ${funcMatch[0]}`);

test('escHtml - HTML Entities', (t) => {
  assert.strictEqual(escHtml('<'), '&lt;', 'Should escape less than');
  assert.strictEqual(escHtml('>'), '&gt;', 'Should escape greater than');
  assert.strictEqual(escHtml('&'), '&amp;', 'Should escape ampersand');
  assert.strictEqual(escHtml(' '), '&nbsp;', 'Should escape space');
});

test('escHtml - Regular Characters', (t) => {
  assert.strictEqual(escHtml('a'), 'a', 'Should not change letters');
  assert.strictEqual(escHtml('Z'), 'Z', 'Should not change capital letters');
  assert.strictEqual(escHtml('1'), '1', 'Should not change numbers');
  assert.strictEqual(escHtml('-'), '-', 'Should not change dashes');
  assert.strictEqual(escHtml(''), '', 'Should return empty string for empty string');
});

test('escHtml - Edge Cases', (t) => {
  assert.strictEqual(escHtml(undefined), undefined, 'Should return undefined for undefined');
  assert.strictEqual(escHtml(null), null, 'Should return null for null');
  assert.strictEqual(escHtml(0), 0, 'Should return number for number type');
  assert.strictEqual(escHtml(true), true, 'Should return boolean for boolean type');
});

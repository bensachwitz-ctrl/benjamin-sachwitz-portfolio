const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Read the index.html file relative to this test file
const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the lerp function using regex, improved to handle potential formatting changes
// Matches the function keyword, name 'lerp', arguments, and the body non-greedily
const lerpMatch = html.match(/function\s+lerp\s*\([^)]*\)\s*\{[\s\S]*?\}/);

if (!lerpMatch) {
  console.error('Failed to find lerp function in index.html');
  process.exit(1);
}

const lerpFuncString = lerpMatch[0];

// Evaluate the function string into a callable function
const lerp = (new Function('return ' + lerpFuncString))();

// Test cases
try {
  // Test 1: Start point
  assert.strictEqual(lerp(0, 10, 0), 0, 'lerp(0, 10, 0) should be 0');

  // Test 2: End point
  assert.strictEqual(lerp(0, 10, 1), 10, 'lerp(0, 10, 1) should be 10');

  // Test 3: Midpoint
  assert.strictEqual(lerp(0, 10, 0.5), 5, 'lerp(0, 10, 0.5) should be 5');

  // Test 4: Extrapolation (above 1)
  assert.strictEqual(lerp(0, 10, 1.5), 15, 'lerp(0, 10, 1.5) should be 15');

  // Test 5: Extrapolation (below 0)
  assert.strictEqual(lerp(0, 10, -0.5), -5, 'lerp(0, 10, -0.5) should be -5');

  // Test 6: Same start and end
  assert.strictEqual(lerp(5, 5, 0.5), 5, 'lerp(5, 5, 0.5) should be 5');

  // Test 7: Negative start/end
  assert.strictEqual(lerp(-10, -5, 0.5), -7.5, 'lerp(-10, -5, 0.5) should be -7.5');

  console.log('✅ All lerp tests passed!');
} catch (error) {
  console.error('❌ Test failed:');
  console.error(error.message);
  process.exit(1);
}

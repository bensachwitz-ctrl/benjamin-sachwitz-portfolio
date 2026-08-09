const fs = require('fs');
const path = require('path');

// Extract the project function directly from index.html to test it exactly as written
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const projectRegex = /function project\(lat,lng\)\{[\s\S]*?return[\s\S]*?\};\n  \}/;
const match = htmlContent.match(projectRegex);

if (!match) {
  throw new Error('Could not find project function in index.html');
}

// We need a wrapper to provide the closure variables cw and ch that the real function uses
const createProject = (cw, ch) => {
  // Use Function constructor to evaluate the extracted string within a specific context
  const factory = new Function('cw', 'ch', `
    ${match[0]}
    return project;
  `);
  return factory(cw, ch);
};

describe('Map Projection - project(lat, lng)', () => {
  // Common canvas sizes for testing
  const CW = 800; // Canvas Width
  const CH = 400; // Canvas Height

  let project;

  beforeEach(() => {
    project = createProject(CW, CH);
  });

  describe('Happy path - Atlantic world focus', () => {
    test('projects coordinates correctly in the center of bounds', () => {
      // center of bounds roughly: lng -45, lat 40
      const result = project(40, -45);

      // Expected calculation:
      // x = ((-45 + 100) / 110) * 800 = (55 / 110) * 800 = 0.5 * 800 = 400
      // y = ((60 - 40) / 40) * 400 = (20 / 40) * 400 = 0.5 * 400 = 200
      expect(result).toEqual({ x: 400, y: 200 });
    });

    test('projects top-left corner coordinates (-100 lng, 60 lat)', () => {
      const result = project(60, -100);

      // Expected x: ((-100 + 100) / 110) * 800 = 0
      // Expected y: ((60 - 60) / 40) * 400 = 0
      // Bounded by max(30)
      expect(result).toEqual({ x: 30, y: 30 });
    });

    test('projects bottom-right corner coordinates (10 lng, 20 lat)', () => {
      const result = project(20, 10);

      // Expected x: ((10 + 100) / 110) * 800 = (110 / 110) * 800 = 800
      // Expected y: ((60 - 20) / 40) * 400 = (40 / 40) * 400 = 400
      // Bounded by min(cw - 30, ch - 30) -> (770, 370)
      expect(result).toEqual({ x: 770, y: 370 });
    });
  });

  describe('Edge cases and out of bounds', () => {
    test('clamps coordinates that are way too far West (lng < -100)', () => {
      const result = project(40, -150);
      // Unclamped x would be < 0
      expect(result.x).toBe(30);
    });

    test('clamps coordinates that are way too far East (lng > 10)', () => {
      const result = project(40, 50);
      // Unclamped x would be > 800
      expect(result.x).toBe(CW - 30);
    });

    test('clamps coordinates that are too far North (lat > 60)', () => {
      const result = project(80, -45);
      // Unclamped y would be < 0
      expect(result.y).toBe(30);
    });

    test('clamps coordinates that are too far South (lat < 20)', () => {
      const result = project(0, -45);
      // Unclamped y would be > 400
      expect(result.y).toBe(CH - 30);
    });
  });

  describe('Canvas size variations', () => {
    test('works correctly with different canvas dimensions', () => {
      const customProject = createProject(1000, 500);
      const result = customProject(40, -45); // Center coordinates

      expect(result).toEqual({ x: 500, y: 250 });
    });

    test('handles small canvas sizes properly', () => {
      // Small canvas where padding (30) is significant
      const customProject = createProject(100, 100);

      // Bottom-right coordinate
      const result = customProject(20, 10);

      // cw - 30 = 70, ch - 30 = 70
      expect(result).toEqual({ x: 70, y: 70 });
    });
  });

  describe('Specific locations from the codebase', () => {
    test('projects London, UK correctly', () => {
      // {name:'London, UK', lat:51.513, lng:-0.083}
      const result = project(51.513, -0.083);

      // Calculations:
      // x = ((-0.083 + 100) / 110) * 800 ≈ 726.6
      // y = ((60 - 51.513) / 40) * 400 ≈ 84.87

      expect(result.x).toBeCloseTo(726.669, 1);
      expect(result.y).toBeCloseTo(84.87, 1);
    });

    test('projects Moncks Corner, SC correctly', () => {
      // {name:'Moncks Corner, SC', lat:33.196, lng:-80.013}
      const result = project(33.196, -80.013);

      // Calculations:
      // x = ((-80.013 + 100) / 110) * 800 ≈ 145.36
      // y = ((60 - 33.196) / 40) * 400 ≈ 268.04

      expect(result.x).toBeCloseTo(145.36, 1);
      expect(result.y).toBeCloseTo(268.04, 1);
    });
  });
});

import { calcTileType, calcHealthLevel } from '../utils';

const boardSize = 5;

test.each([
  ['with idx 0', 0, 'top-left'],
  ['with idx 2', 2, 'top'],
  ['with idx 4', 4, 'top-right'],
  ['with idx 10', 10, 'left'],
  ['with idx 9', 9, 'right'],
  ['with idx 24', 24, 'bottom-right'],
  ['with idx 20', 20, 'bottom-left'],
  ['with idx 22', 22, 'bottom'],
  ['with idx 12', 12, 'center'],
])('correct drawing %s', (_, idx, expected) => {
  const result = calcTileType(idx, boardSize);
  expect(result).toBe(expected);
});

test.each([
  ['with 13', 13, 'critical'],
  ['with 40', 40, 'normal'],
  ['with 80', 80, 'high'],
])('check calcHealthLevel %s', (_, health, expected) => {
  const result = calcHealthLevel(health);
  expect(result).toBe(expected);
});

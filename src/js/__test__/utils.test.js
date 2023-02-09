import { calcTileType } from '../utils';

const boardSize = 5;

test.each([
  ['with idx 0', 0, 'top-left'],
  ['with idx 2', 2, 'top'],
  ['with idx 4', 4, 'top-right'],
  ['with idx 10', 10, 'eft'],
  ['with idx 9', 9, 'right'],
  ['with idx 24', 24, 'bottom-right'],
  ['with idx 20', 20, 'bottom-left'],
  ['with idx 22', 22, 'bottom'],
  ['with idx 12', 12, 'center'],
])('correct drawing %s', (_, idx, expected) => {
  const result = calcTileType(idx, boardSize);
  expect(result).toEqual(expected);
});

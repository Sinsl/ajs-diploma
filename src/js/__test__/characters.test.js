import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

const bowman = new Bowman(1);
const daemon = new Daemon(1);
const magician = new Magician(1);
const swordsman = new Swordsman(1);
const undead = new Undead(1);
const vampire = new Vampire(1);

test('create Bowman', () => {
  const result = new Bowman(1);
  expect(result).toEqual(bowman);
  expect(result.type).toBe('bowman');
});
test('create Daemon', () => {
  const result = new Daemon(1);
  expect(result).toEqual(daemon);
  expect(result.type).toBe('daemon');
});
test('create Magician', () => {
  const result = new Magician(1);
  expect(result).toEqual(magician);
  expect(result.type).toBe('magician');
});
test('create Swordsman', () => {
  const result = new Swordsman(1);
  expect(result).toEqual(swordsman);
  expect(result.type).toBe('swordsman');
});
test('create Undead', () => {
  const result = new Undead(1);
  expect(result).toEqual(undead);
  expect(result.type).toBe('undead');
});
test('create Vampire', () => {
  const result = new Vampire(1);
  expect(result).toEqual(vampire);
  expect(result.type).toBe('vampire');
});
test('check Character error type', () => {
  expect(() => {
    // eslint-disable-next-line no-unused-vars
    const ch1 = new Character(1);
  }).toThrowError('Нельзя создавать персонажа типа Character');
});

import GameController from '../GameController';
import GameStateService from '../GameStateService';
import Swordsman from '../characters/Swordsman';
import Daemon from '../characters/Daemon';
import PositionedCharacter from '../PositionedCharacter';
import GamePlay from '../GamePlay';

const gamePlay = new GamePlay();
const stateService = new GameStateService('localStorage');

const game = new GameController(gamePlay, stateService);
jest.mock('../GamePlay');
const charPlayer1 = new Swordsman(1);
const charPlayer2 = new Swordsman(1);
const charBot1 = new Daemon(1);
const charBot2 = new Daemon(1);
game.gameState.arrayPlayerPosition.push(
  new PositionedCharacter(charPlayer1, 32),
  new PositionedCharacter(charPlayer2, 18),
);
game.gameState.arrayBotPosition.push(
  new PositionedCharacter(charBot1, 15),
  new PositionedCharacter(charBot2, 54),
);
game.teamPlayer.addAll(charPlayer1, charPlayer2);
game.teamBot.addAll(charBot1, charBot2);
game.gamePlay.boardSize = 8;

test('check setFieldBorderIdx', () => {
  game.setFieldBorderIdx();
  const expected = {
    borderLeft: [0, 8, 16, 24, 32, 40, 48, 56],
    borderRight: [7, 15, 23, 31, 39, 47, 55, 63],
  };
  expect(game.fieldBordersIdx).toEqual(expected);
});

test('check arrAcceptableCell', () => {
  const result = game.arrAcceptableCell(18, 4);
  const expected = [
    26, 10, 34, 2, 42, 50, 17, 9, 25, 16, 0, 32, 19, 11, 27, 20, 4, 36, 21, 45, 22, 54,
  ];
  expect(result).toEqual(expected);
});

test('check arrayAllowedPositions with player', () => {
  const result = game.arrayAllowedPositions('player');
  const expected = [
    0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57,
  ];
  expect(result).toEqual(expected);
});

test('check arrayAllowedPositions with bot', () => {
  const result = game.arrayAllowedPositions('bot');
  const expected = [
    7, 6, 15, 14, 23, 22, 31, 30, 39, 38, 47, 46, 55, 54, 63, 62,
  ];
  expect(result).toEqual(expected);
});

test('check calcDamage > 0', () => {
  const result = game.calcDamage(18, 54);
  expect(result).toBe(30);
  expect(charBot2.health).toBe(20);
});

test('check getHealt', () => {
  const result = game.getHealth(54);
  expect(result).toBe(20);
});

test('check calcDamage === 0', () => {
  const result = game.calcDamage(18, 54);
  expect(result).toBe(30);
  expect(charBot2.health).toBe(0);
});

test('check deleteCharacter bot', () => {
  game.deleteCharacter(54);
  expect(game.gameState.arrayBotPosition.length).toBe(1);
  expect(game.teamBot.members.size).toBe(1);
});

test('check deleteCharacter player', () => {
  game.deleteCharacter(18);
  expect(game.gameState.arrayPlayerPosition.length).toBe(1);
  expect(game.teamPlayer.members.size).toBe(1);
});

game.gameState.level = 2;

test('check addCharacterTeam with player', () => {
  const team = game.addCharacterTeam('player');
  const types = ['bowman', 'magician', 'swordsman'];
  expect(team.length).toBe(2);
  expect(types).toContain(team[0].type);
  expect(types).toContain(team[1].type);
});

test('check addCharacterTeam with bot', () => {
  const team = game.addCharacterTeam('bot');
  const types = ['daemon', 'undead', 'vampire'];
  expect(team.length).toBe(2);
  expect(types).toContain(team[0].type);
  expect(types).toContain(team[1].type);
});

test('check addCharacterPosition with player', () => {
  const arrTeam = game.addCharacterTeam('player');
  game.addCharacterPosition(arrTeam, 'player');
  expect(game.gameState.arrayPlayerPosition.length).toBe(3);
  game.teamPlayer.addAll(...arrTeam);
});

test('check addCharacterPosition with bot', () => {
  const arrTeam = game.addCharacterTeam('bot');
  game.addCharacterPosition(arrTeam, 'bot');
  expect(game.gameState.arrayBotPosition.length).toBe(3);
  game.teamBot.addAll(...arrTeam);
});

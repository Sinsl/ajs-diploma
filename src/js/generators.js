import Team from './Team';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const SelectedСlass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    switch (SelectedСlass) {
      case 'bowman':
        yield new Bowman(level);
        break;
      case 'swordsman':
        yield new Swordsman(level);
        break;
      case 'magician':
        yield new Magician(level);
        break;
      case 'daemon':
        yield new Daemon(level);
        break;
      case 'undead':
        yield new Undead(level);
        break;
      case 'vampire':
        yield new Vampire(level);
        break;
      default:
        break;
    }
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let counter = characterCount;
  const team = new Team();
  const playerGenerator = characterGenerator(allowedTypes, maxLevel);
  while (counter > 0) {
    const character = playerGenerator.next().value;
    team.add(character);
    counter -= 1;
  }
  return team;
}

/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor() {
    this.members = new Set();
  }

  add(gamer) {
    if (this.members.has(gamer)) {
      throw new Error('Такой игрок уже есть в команде');
    } else {
      this.members.add(gamer);
    }
  }
}

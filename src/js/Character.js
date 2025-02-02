/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type) {
    if (new.target.name === 'Character') {
      throw new Error('Нельзя создавать персонажа типа Character');
    }
    const arrayType = ['bowman', 'daemon', 'magician', 'swordsman', 'undead', 'vampire'];
    if (arrayType.includes(type) === false) {
      throw new Error('Неверный тип игрока');
    }
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
  }

  levelUp() {
    this.attack = Math.max(
      this.attack,
      Math.round(this.attack * ((80 + this.health) / 100)),
    );

    // eslint-disable-next-line no-unused-expressions
    (this.health + 80) > 100 ? this.health = 100 : this.health += 80;
  }
}

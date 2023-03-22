export default class GameState {
  constructor() {
    this.level = 1;
    this.isMovePlayer = true;
    this.arrayPlayerPosition = [];
    this.arrayBotPosition = [];
    this.statistic = { player: 0, bot: 0 };
  }

  get positions() {
    return [...this.arrayPlayerPosition, ...this.arrayBotPosition];
  }

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      return {
        object,
      };
    }
    return null;
  }
}

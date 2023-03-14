/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line object-curly-newline
import { generateTeam } from './generators';
import typeTeams from './typeTeams';
import PositionedCharacter from './PositionedCharacter';
import themes from './themes';
import GameState from './GameState';
import Team from './Team';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.fieldBordersIdx = {};
    this.teamPlayer = new Team();
    this.teamBot = new Team();
    this.isAttack = false;
  }

  init() {
    this.eventSubscription();
    this.setFieldBorderIdx();
    this.loadGame();
  }

  /**
   * Определяет боковые границы поля
   * Что-бы не запрашивать постоянно
   * @returns объект с двумя массивами
   */
  setFieldBorderIdx() {
    const { boardSize } = this.gamePlay;
    const borderLeft = [];
    const borderRight = [];
    for (let i = 0; i < boardSize ** 2; i += boardSize) {
      borderLeft.push(i);
      borderRight.push(i + (boardSize - 1));
    }
    this.fieldBordersIdx = { borderLeft, borderRight };
  }

  /**
  * Добавление игроков на поле
  * Отрисовка поля
  */
  loadGame(save) {
    const keys = Object.keys(themes);
    this.gamePlay.drawUi(themes[keys[this.gameState.level - 1]]);
    if (!save) {
      // добавляем игроков
      const charactersPlayer = this.addCharacterTeam('player');
      const charactersBot = this.addCharacterTeam('bot');
      if (charactersPlayer.length > 0) {
        this.teamPlayer.addAll(...charactersPlayer);
        this.addCharacterPosition(charactersPlayer, 'player');
      }
      if (charactersBot.length > 0) {
        this.teamBot.addAll(...charactersBot);
        this.addCharacterPosition(charactersBot, 'bot');
      }
    }
    // отрисовка поля
    this.gamePlay.redrawPositions([
      ...this.gameState.arrayPlayerPosition,
      ...this.gameState.arrayBotPosition,
    ]);

    // отрисовка статистики
    this.gamePlay.redrawStatistic(this.gameState.statistic, this.gameState.level);

    // если ход у бота - запускаем
    if (!this.gameState.isMovePlayer) {
      this.botMove();
    }
  }

  /**
   * Метод формирует массив недостающих игроков
   * @param typeTeam тип команды
   * @returns массив с новыми игроками
   */
  addCharacterTeam(typeTeam) {
    let team = [];
    if (typeTeam === 'player') {
      team = generateTeam(
        typeTeams.typesPlayer,
        this.gameState.level,
        this.gameState.level + 1 - this.teamPlayer.members.size,
      );
    }

    if (typeTeam === 'bot') {
      team = generateTeam(
        typeTeams.typeBot,
        this.gameState.level,
        this.gameState.level + 1 - this.teamBot.members.size,
      );
    }
    // если уровень выше 1 - повышаем характеристики
    if (this.gameState.level > 1) {
      team.forEach((item, idx) => {
        // eslint-disable-next-line no-unused-expressions
        (item.attack * 2) > 100 ? team[idx].attack = 100 : team[idx].attack *= 2;
        // eslint-disable-next-line no-unused-expressions
        (item.defence * 2) > 100 ? team[idx].defence = 100 : team[idx].defence *= 2;
      });
    }
    return team;
  }

  /**
   * Метод формирует массив возможных позиций
   * @param typeTeam тип команды
   * @returns массив с индексами ячеек
   */
  arrayAllowedPositions(typeTeam) {
    const arrayIdxPosition = [];
    if (typeTeam === 'player') {
      for (let i = 0; i < this.gamePlay.boardSize ** 2; i += this.gamePlay.boardSize) {
        arrayIdxPosition.push(i, i + 1);
      }
    }
    if (typeTeam === 'bot') {
      for (let i = 8; i <= this.gamePlay.boardSize ** 2; i += this.gamePlay.boardSize) {
        arrayIdxPosition.push(i - 1, i - 2);
      }
    }
    return arrayIdxPosition;
  }

  /**
   * Метод добавляет позиции на поле игрокам
   * @param arrChar массив игроков
   * @param typeTeam тип команды
   */
  addCharacterPosition(arrChar, typeTeam) {
    const arrayIdxPosition = this.arrayAllowedPositions(typeTeam);
    // убираем ячейки, где уже есть игроки
    const employed = [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .map((item) => item.position);
    employed.forEach((item) => {
      const found = arrayIdxPosition.findIndex((elem) => elem === item);
      if (found >= 0) {
        arrayIdxPosition.splice(found, 1);
      }
    });

    if (typeTeam === 'player') {
      arrChar.forEach((item) => {
        const idxPosition = Math.floor(Math.random() * arrayIdxPosition.length);
        this.gameState.arrayPlayerPosition
          .push(new PositionedCharacter(item, arrayIdxPosition[idxPosition]));
        arrayIdxPosition.splice(idxPosition, 1);
      });
    }

    if (typeTeam === 'bot') {
      arrChar.forEach((item) => {
        const idxPosition = Math.floor(Math.random() * arrayIdxPosition.length);
        this.gameState.arrayBotPosition
          .push(new PositionedCharacter(item, arrayIdxPosition[idxPosition]));
        arrayIdxPosition.splice(idxPosition, 1);
      });
    }
  }

  eventSubscription() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  /**
   * Метод ищет и возвращает индекс выбранного игрока
   * @returns индекс ячейки
   */
  findIdxSelected() {
    return this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-yellow'));
  }

  onCellClick(index) {
    if (!this.gameState.isMovePlayer) {
      return;
    }
    const idxSelected = this.findIdxSelected();
    const charPlayer = this.gameState.arrayPlayerPosition.find((item) => item.position === index);
    const charBot = this.gameState.arrayBotPosition.find((item) => item.position === index);

    // если не выбран свой игрок
    if (idxSelected < 0) {
      // клик на ячейку с ботом/персонажем/пустую
      if (charBot) {
        GamePlay.showError('Это чужой персонаж');
      } else if (charPlayer) {
        this.gamePlay.selectCell(index);
      } else {
        GamePlay.showError('В этой клетке нет персонажей');
      }
      return;
    }
    // если свой игрок выбран
    if (idxSelected >= 0) {
      if (charPlayer) {
        this.gamePlay.deselectCell(idxSelected);
        this.gamePlay.selectCell(index);
        return;
      }

      const charSelected = this.gameState.arrayPlayerPosition
        .find((item) => item.position === idxSelected);
      const arrIdxAccept = this.arrAcceptableCell(idxSelected, charSelected.character.distance);

      // если клетки входят в диапазон
      if (arrIdxAccept.includes(index)) {
        if (charBot) {
          this.startAttack(idxSelected, index);
        } else {
          this.gamePlay.deselectCell(idxSelected);
          this.gamePlay.deselectCell(index);
          charSelected.position = index;
          this.characterMovement();
          this.botMove();
        }
      }
    }
  }

  onCellEnter(index) {
    if (!this.gameState.isMovePlayer) {
      return;
    }
    this.gamePlay.setCursor(cursors.auto);
    const charPlayer = this.gameState.arrayPlayerPosition.find((item) => item.position === index);
    const charBot = this.gameState.arrayBotPosition.find((item) => item.position === index);

    // показываем подсказки
    if (charPlayer) {
      const char = charPlayer.character;
      const msgPlayer = ` \u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health} `;
      this.gamePlay.showCellTooltip(msgPlayer, index);
    }
    if (charBot) {
      const char = charBot.character;
      const msgPlayer = ` \u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health} `;
      this.gamePlay.showCellTooltip(msgPlayer, index);
    }
    if (this.isAttack) {
      return;
    }

    // если игрок выбран
    const idxSelected = this.findIdxSelected();
    if (idxSelected >= 0) {
      const charSelected = this.gameState.arrayPlayerPosition
        .find((item) => item.position === idxSelected);
      const arrIdxAccept = this.arrAcceptableCell(idxSelected, charSelected.character.distance);

      // если клетки входят в диапазон
      if (arrIdxAccept.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');

        // если в диапазоне бот
        if (charBot) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        }
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
      // если свой персонаж
      if (charPlayer) {
        this.gamePlay.setCursor(cursors.pointer);
        if (idxSelected !== index) {
          this.gamePlay.deselectCell(index);
        }
      }
    }
  }

  onCellLeave(index) {
    // удаляем подсказку
    const character = [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .find((item) => item.position === index);
    if (character) {
      this.gamePlay.hideCellTooltip(index);
    }

    // если игрок выбран
    const idxSelected = this.findIdxSelected();
    if (idxSelected >= 0) {
      if (index !== idxSelected) {
        this.gamePlay.deselectCell(index);
      }
    }
  }

  onNewGameClick() {
    this.gameState.level = 1;
    this.gameState.isMovePlayer = true;
    this.gameState.arrayPlayerPosition = [];
    this.gameState.arrayBotPosition = [];
    this.teamPlayer.deleteAll();
    this.teamBot.deleteAll();
    this.gamePlay.hideMessage();
    this.loadGame();
  }

  onSaveGameClick() {
    const save = {
      level: this.gameState.level,
      isMove: this.gameState.isMovePlayer,
      arrPlayer: this.gameState.arrayPlayerPosition,
      arrBot: this.gameState.arrayBotPosition,
      statistic: this.gameState.statistic,
    };
    this.gamePlay.showMessage('Игра сохранена');
    setTimeout(() => this.gamePlay.hideMessage(), 500);
    this.stateService.save(save);
  }

  onLoadGameClick() {
    let save = null;
    try {
      save = this.stateService.load();
    } catch (error) {
      this.gamePlay.showMessage(error);
      setTimeout(() => this.gamePlay.hideMessage(), 500);
    }
    if (save) {
      this.gamePlay.hideMessage();
      this.gamePlay.showMessage('Игра загружена');
      setTimeout(() => {
        this.gamePlay.hideMessage();
        this.gameState.level = save.level;
        this.gameState.isMovePlayer = save.isMove;
        this.gameState.arrayPlayerPosition = save.arrPlayer;
        this.gameState.arrayBotPosition = save.arrBot;
        this.gameState.statistic = save.statistic;
        this.teamPlayer.deleteAll();
        this.teamBot.deleteAll();
        this.teamPlayer.addAll(...save.arrPlayer.map((item) => item.character));
        this.teamBot.addAll(...save.arrBot.map((item) => item.character));
        this.loadGame('load');
      }, 500);
    }
  }

  /**
   * Метод запускает атаку
   * @param attackIdx индекс атакующего игрока
   * @param targetIdx индекс атакованного игрока
   */
  startAttack(attackIdx, targetIdx) {
    this.isAttack = true;
    const damage = this.calcDamage(attackIdx, targetIdx);
    this.gamePlay.showDamage(targetIdx, damage)
      .then(() => {
        this.gamePlay.deselectCell(attackIdx);
        this.gamePlay.deselectCell(targetIdx);
      })
      .finally(() => {
        this.gameState.isMovePlayer
          ? this.gameState.statistic.player += damage
          : this.gameState.statistic.bot += damage;
        this.characterMovement();
        this.isAttack = false;
        if (this.getHealth(targetIdx) === 0) {
          this.deleteCharacter(targetIdx);
        } else {
          // eslint-disable-next-line no-lonely-if
          if (!this.gameState.isMovePlayer) {
            this.botMove();
          }
        }
      });
  }

  /**
   * Метод рассчитывает и применяет урон
   * @param attackIdx индекс атакующего игрока
   * @param targetIdx индекс атакованного игрока
   * @returns уровень урона
   */
  calcDamage(attackIdx, targetIdx) {
    const attacker = [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .find((item) => item.position === attackIdx).character;
    const target = [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .find((item) => item.position === targetIdx).character;
    const damage = Math.ceil(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
    (target.health - damage) < 0 ? target.health = 0 : target.health -= damage;
    return damage;
  }

  /**
   * Метод рассчитывает и применяет урон
   * @param index индекс игрока
   * @returns уровень жизни
   */
  getHealth(index) {
    return [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .find((item) => item.position === index).character.health;
  }

  /**
   * Метод удаляет игрока с поля
   * @param index индекс по которому нужно удалить игрока
   */
  deleteCharacter(index) {
    // ищем в команде юзера
    const positionPlayer = this.gameState.arrayPlayerPosition
      .findIndex((item) => item.position === index);
    if (positionPlayer >= 0) {
      const charPlayer = this.gameState.arrayPlayerPosition.splice(positionPlayer, 1)[0].character;
      this.gameState.statistic.bot += Math.round(
        Math.max(charPlayer.attack, charPlayer.defence) * charPlayer.distance,
      );
      this.teamPlayer.delete(charPlayer);
    } else {
      // ищем в команде бота
      const posBot = this.gameState.arrayBotPosition
        .findIndex((item) => item.position === index);
      const charBot = this.gameState.arrayBotPosition.splice(posBot, 1)[0].character;
      this.gameState.statistic.player += Math.round(
        Math.max(charBot.attack, charBot.defence) * charBot.distance,
      );
      this.teamBot.delete(charBot);
    }
    // перерисовка поля, переход хода
    this.characterMovement();
    // eslint-disable-next-line max-len
    if ((this.teamPlayer.members.size !== 0 || this.teamBot.members.size !== 0) && !this.gameState.isMovePlayer) {
      this.botMove();
    }
    if (this.teamPlayer.members.size === 0) {
      this.gameState.statistic.bot += this.gameState.level * 100;
      this.levelUp();
    }
    if (this.teamBot.members.size === 0) {
      this.gameState.statistic.player += this.gameState.level * 100;
      this.levelUp();
    }
  }

  /**
   * Метод повышает уровень игры
   */
  levelUp() {
    // определяем характеристики оставшихся игроков
    [...this.gameState.arrayPlayerPosition, ...this.gameState.arrayBotPosition]
      .forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.character.attack = Math.max(
          item.character.attack,
          Math.round(item.character.attack * ((80 + item.character.health) / 100)),
        );
        // eslint-disable-next-line no-unused-expressions
        (item.character.health + 80) > 100
          ? item.character.health = 100
          : item.character.health += 80;
      });

    this.gameState.level += 1;
    if (this.gameState.level === 5) {
      this.gamePlay.showMessage('Игра завершена');
      return;
    }
    this.loadGame();
  }

  /**
   * Метод осуществляет отрисовку поля и переход хода
   * Применяется для перемещения игрока
   */
  characterMovement() {
    this.gamePlay.redrawPositions([
      ...this.gameState.arrayPlayerPosition,
      ...this.gameState.arrayBotPosition,
    ]);

    // отрисовка статистики
    this.gamePlay.redrawStatistic(this.gameState.statistic, this.gameState.level);

    // eslint-disable-next-line no-unused-expressions
    this.gameState.isMovePlayer
      ? this.gameState.isMovePlayer = false
      : this.gameState.isMovePlayer = true;
  }

  /**
   * Метод отвечает за логику игры бота
   */
  botMove() {
    if (this.gameState.isMovePlayer) {
      return;
    }
    // выбираем игрока с мах дистанцией
    const arrDistance = this.gameState.arrayBotPosition.map((item) => item.character.distance);
    const max = Math.max(...arrDistance);
    const checkedChar = this.gameState.arrayBotPosition
      .find((item) => item.character.distance === max);
    this.gamePlay.selectCell(checkedChar.position);

    // получаем диапазон возможных ходов
    const arrIdxAccept = this.arrAcceptableCell(
      checkedChar.position,
      checkedChar.character.distance,
    );

    // удаляем из диапазона позиции игроков бота
    const arrPositionBot = this.gameState.arrayBotPosition.map((item) => item.position);
    arrPositionBot.forEach((item) => {
      const idxInclude = arrIdxAccept.findIndex((elem) => elem === item);
      if (idxInclude >= 0) {
        arrIdxAccept.splice(idxInclude, 1);
      }
    });

    // проверяем наличие юреза в диапазоне атаки
    const arrPositionPlayer = this.gameState.arrayPlayerPosition.map((item) => item.position);
    let attackedPositionChar = -1;
    arrPositionPlayer.forEach((item) => {
      if (arrIdxAccept.includes(item)) {
        attackedPositionChar = item;
      }
    });

    // если нашелся игрок юзера, запускаем атаку
    if (attackedPositionChar >= 0) {
      this.gamePlay.selectCell(attackedPositionChar, 'red');
      this.startAttack(checkedChar.position, attackedPositionChar);
    } else {
      // если не нашелся, делаем переход
      const idxRandome = Math.floor(Math.random() * arrIdxAccept.length);
      this.gamePlay.deselectCell(checkedChar.position);
      checkedChar.position = arrIdxAccept[idxRandome];
      this.characterMovement();
    }
  }

  /**
   * Метод определяет диапазон ячеек для атаки и перехода
   * @param idx индекс игрока, для которого рассчитывается диапазо
   * @param distance дистанция
   * @returns массив с диапазоном индексов
   */
  arrAcceptableCell(idx, distance) {
    const { boardSize } = this.gamePlay;
    const arrIdx = [];
    for (let i = 1; i <= distance; i += 1) {
      arrIdx.push(idx + (boardSize * i));
      arrIdx.push(idx - (boardSize * i));
    }
    if (!this.fieldBordersIdx.borderLeft.includes(idx)) {
      for (let i = 1; i <= distance; i += 1) {
        arrIdx.push(idx - i);
        arrIdx.push(idx - (boardSize * i + i));
        arrIdx.push(idx + (boardSize * i - i));
        if (this.fieldBordersIdx.borderLeft.includes(idx - i)) {
          break;
        }
      }
    }
    if (!this.fieldBordersIdx.borderRight.includes(idx)) {
      for (let i = 1; i <= distance; i += 1) {
        arrIdx.push(idx + i);
        arrIdx.push(idx - (boardSize * i - i));
        arrIdx.push(idx + (boardSize * i + i));
        if (this.fieldBordersIdx.borderRight.includes(idx + i)) {
          break;
        }
      }
    }
    return arrIdx.filter((item) => item >= 0 && item < boardSize ** 2);
  }
}

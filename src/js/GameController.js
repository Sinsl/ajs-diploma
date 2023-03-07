// eslint-disable-next-line object-curly-newline
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import themes from './themes';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.countCharacter = 2;
    this.allowedTypesPlayer = ['bowman', 'swordsman', 'magician'];
    this.allowedTypesBot = ['daemon', 'undead', 'vampire'];
    this.arrayTeamPlayer = [];
    this.arrayTeamBot = [];
    this.fieldBordersIdx = {};
    this.isMovePlayer = true;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.addTeamsField();
    this.eventSubscription();
    this.setFieldBorderIdx();
  }

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
  addTeamsField() {
    const arrayPositionedCharacter = this.createArrayPositionCharacter();
    this.gamePlay.redrawPositions(arrayPositionedCharacter);
  }

  /**
  * Формирование игроков для двух команд
  */
  createArrayPositionCharacter() {
    const typeTeamPlayer = 'player';
    const typeTeamBot = 'bot';
    const arrPlayers = this.createPlayerPositions(this.allowedTypesPlayer, typeTeamPlayer);
    this.arrayTeamPlayer.push(...arrPlayers);
    const arrBot = this.createPlayerPositions(this.allowedTypesBot, typeTeamBot);
    this.arrayTeamBot.push(...arrBot);
    return [...this.arrayTeamPlayer, ...this.arrayTeamBot];
  }

  /**
  * Добавление рандомных позиций у игроков
  * в зависимости от переданного типа команды
  */
  createPlayerPositions(allowedTypes, typeTeam) {
    const teamSet = this.creatingTeams(allowedTypes);
    const arrayTeam = [...teamSet.members];
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
    const arrayPositionCharacterTeam = [];
    arrayTeam.forEach((item) => {
      const idxPosition = Math.floor(Math.random() * arrayIdxPosition.length);
      arrayPositionCharacterTeam.push(new PositionedCharacter(item, arrayIdxPosition[idxPosition]));
      arrayIdxPosition.splice(idxPosition, 1);
    });
    return arrayPositionCharacterTeam;
  }

  // eslint-disable-next-line class-methods-use-this
  creatingTeams(allowedTypes) {
    const team = generateTeam(allowedTypes, 4, this.countCharacter);
    return team;
  }

  eventSubscription() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  findIdxSelected() {
    return this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-yellow'));
  }

  onCellClick(index) {
    if (!this.isMovePlayer) {
      return;
    }
    const idxSelected = this.findIdxSelected();
    const charPlayer = this.arrayTeamPlayer.find((item) => item.position === index);
    const charBot = this.arrayTeamBot.find((item) => item.position === index);

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

      // если клик в пределах диапазона
      const charSelected = this.arrayTeamPlayer.find((item) => item.position === idxSelected);
      const arrIdxAccept = this.arrAcceptableCell(idxSelected, charSelected.character.distance);

      // если клетки входят в диапазон
      if (arrIdxAccept.includes(index)) {
        this.gamePlay.deselectCell(idxSelected);
        this.gamePlay.deselectCell(index);

        if (charBot) {
          console.log('атака')
          this.startAttack(charSelected, charBot);
        } else {
          charSelected.position = index;
          this.characterMovement();
          console.log('перемещаем своего')
          console.log(`из клетки ${idxSelected} в клетку ${index}`);
          this.botMove();
        }
      }
    }
  }

  startAttack(attacking, attacked) {
    
  }

  characterMovement() {
    console.log('отрисовка поля')
    this.gamePlay.redrawPositions([...this.arrayTeamPlayer, ...this.arrayTeamBot]);
    // eslint-disable-next-line no-unused-expressions
    this.isMovePlayer ? this.isMovePlayer = false : this.isMovePlayer = true;
    console.log(`ход игрока: ${this.isMovePlayer}`)
  }

  botMove() {
    console.log('ход компьютера')
    if (this.isMovePlayer) {
      return;
    }
    // eslint-disable-next-line no-unused-expressions
    this.isMovePlayer ? this.isMovePlayer = false : this.isMovePlayer = true;
    console.log(`ход игрока: ${this.isMovePlayer}`)
  }

  // eslint-disable-next-line class-methods-use-this
  messageTooltip(character) {
    return `\u{1F396} ${character.level} \u{2694} ${character.attack} \u{1F6E1} ${character.defence} \u{2764} ${character.health}`;
  }

  onCellEnter(index) {
    if (!this.isMovePlayer) {
      return;
    }
    const charPlayer = this.arrayTeamPlayer.find((item) => item.position === index);
    const charBot = this.arrayTeamBot.find((item) => item.position === index);

    // показываем подсказки
    if (charPlayer) {
      this.gamePlay.showCellTooltip(this.messageTooltip(charPlayer.character), index);
    }
    if (charBot) {
      this.gamePlay.showCellTooltip(this.messageTooltip(charBot.character), index);
    }

    // если игрок выбран
    const idxSelected = this.findIdxSelected();
    if (idxSelected >= 0) {
      const charSelected = this.arrayTeamPlayer.find((item) => item.position === idxSelected);
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
    const character = [...this.arrayTeamPlayer, ...this.arrayTeamBot]
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

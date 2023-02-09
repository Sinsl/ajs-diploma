// eslint-disable-next-line object-curly-newline
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import themes from './themes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.countCharacter = 4;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.addTeamsField();
    this.someMethodName();
  }

  addTeamsField() {
    const arrayPositionedCharacter = this.createArrayPositionCharacter();
    this.gamePlay.redrawPositions(arrayPositionedCharacter);
  }

  createArrayPositionCharacter() {
    const setAllowedTypesPlayer = ['bowman', 'swordsman', 'magician'];
    const setAllowedTypesOpponent = ['daemon', 'undead', 'vampire'];
    const typeTeamPlayer = 'player';
    const typeTeamOpponent = 'opponent';
    this.arrayTeamPlayer = this.createPlayerPositions(setAllowedTypesPlayer, typeTeamPlayer);
    this.arrayTeamOpponent = this.createPlayerPositions(setAllowedTypesOpponent, typeTeamOpponent);
    return [...this.arrayTeamPlayer, ...this.arrayTeamOpponent];
  }

  createPlayerPositions(allowedTypes, typeTeam) {
    const teamSet = this.creatingTeams(allowedTypes);
    const arrayTeam = [...teamSet.members];
    const arrayIdxPosition = [];
    if (typeTeam === 'player') {
      for (let i = 0; i < this.gamePlay.boardSize ** 2; i += this.gamePlay.boardSize) {
        arrayIdxPosition.push(i, i + 1);
      }
    }
    if (typeTeam === 'opponent') {
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
    const team = generateTeam(allowedTypes, 1, this.countCharacter);
    return team;
  }

  someMethodName() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    this.arrayTeamPlayer.forEach((item) => {
      if (item.position === index) {
        this.gamePlay.selectCell(index);
      } else {
        this.gamePlay.deselectCell(item.position);
      }
    });
  }

  messageTooltip(character) {
    return `\u{1F396} ${character.level} \u{2694} ${character.attack} \u{1F6E1} ${character.defence} \u{2764} ${character.health}`;
  }

  onCellEnter(index) {
    [...this.arrayTeamPlayer, ...this.arrayTeamOpponent].forEach((item) => {
      if (item.position === index) {
        this.gamePlay.showCellTooltip(this.messageTooltip(item.character), index);
      }
    });
  }

  onCellLeave(index) {
    [...this.arrayTeamPlayer, ...this.arrayTeamOpponent].forEach((item) => {
      if (item.position === index) {
        this.gamePlay.hideCellTooltip(index);
      }
    });
  }
}

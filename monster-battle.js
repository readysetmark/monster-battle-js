function clone(object) {
  function OneShotConstructor(){}
  OneShotConstructor.prototype = object;
  return new OneShotConstructor();
}

function method(object, name) {
  return function() {
    return object[name].apply(object, arguments);
  };
}

function randomInteger(max) {
  return Math.ceil(Math.random() * max);
}



function Monster(type) {
  this.health = randomInteger(10);
  this.monsterType = type;
}
Monster.prototype.isDead = function() {
  return this.health <= 0;
};
Monster.prototype.show = function() {
  if (this.isDead()) return "**dead**";
  else return "(Health=" + this.health + ") " + this.description();
};
Monster.prototype.description = function() {
  return "A fierce " + this.monsterType;
}
Monster.prototype.hit = function(damage) {
  this.health -= damage;
  var msg = "You hit the " + this.monsterType + ", knocking off " + damage
      + " health points!";
  if (this.isDead())
    msg +=  " The " + this.monsterType + " has been slain!";
  return msg;
}

function OrcMonster() {
  Monster.call(this, "Orc");
  this.clubLevel = randomInteger(8);
}
OrcMonster.prototype = clone(Monster.prototype);
OrcMonster.prototype.constructor = OrcMonster;
OrcMonster.prototype.description = function() {
  return "A wicked orc with a level " + this.clubLevel + " club";
};
OrcMonster.prototype.attack = function() {
  var dmg = randomInteger(this.clubLevel);
  var msg = "An orc swings his club at you and knocks off " + dmg + " of your health points."
  return {message: msg, damage: dmg};
};


function Player() {
  this.health = 30;
  this.agility = 30;
  this.strength = 30;
  this.attacks = {
    "s": "[s]tab",
    "d": "[d]ouble swing",
    "r": "[r]oundhouse"
  }
}
Player.prototype.isDead = function() {
  return this.health <= 0;
};
Player.prototype.getNumberOfAttacksForRound = function() {
  return 1 + Math.floor(Math.max(0, this.agility) / 15)
}
Player.prototype.getRoundhouseAttacks = function() {
  return 1 + randomInteger(Math.floor(this.strength / 3))
}
Player.prototype.getAttackOptions = function() {
  var attacks = "Select attack style: ";
  for(var attack in this.attacks) {
    attacks = attacks + " " + this.attacks[attack];
  }
  return attacks;
};
Player.prototype.show = function() {
  return "You are a valiant knight with a health of " + this.health
    + ", an agility of " + this.agility + ", and a strength of " + this.strength + "."
};



function GameState() {
  this.player = null;
  this.playerAction = null;
  this.attacksRemaining = null;
  this.monsters = null;
  this.nextCommandHandler = this.newGameHandler;
}
GameState.prototype.newGameHandler = function(line) {
  this.player = new Player();
  this.playerAction = null;
  this.attacksRemaining = null;
  this.monsters = [new OrcMonster()];
  return this.startRound();
};
GameState.prototype.startRound = function() {
  var messages = []
  this.attacksRemaining = this.player.getNumberOfAttacksForRound();
  this.showMonsters(messages);
  this.showAttackPrompt(messages);
  return messages
};
GameState.prototype.showMonsters = function(messages) {
  messages.push({msg: "You are faced with these foes:"});
  for (var i = 0; i < this.monsters.length; i++) {
    messages.push({msg: (i+1) + ". " + this.monsters[i].show()});
  }
};
GameState.prototype.showAttackPrompt = function(messages) {
  messages.push({msg: this.player.show(), className: "jquery-console-player-status"});
  messages.push({msg: this.player.getAttackOptions(), className: "jquery-console-options"});
  this.nextCommandHandler = this.attackHandler;
};
GameState.prototype.attackHandler = function(line) {
  var messages = [];
  switch(line) {
    // case "s":
    //   this.playerAction = "stab";
    //   this.attacksRemaining -= 1;
    //   this.pickMonster(messages);
    //   break;

    // case "d":
    //   this.playerAction = "doubleSwing1";
    //   this.attacksRemaining -= 1;
    //   this.pickMonster(messages);
    //   break;

    case "r":
      this.playerAction = "roundhouse";
      this.attacksRemaining -= 1;
      this.roundhouseAttack(messages);
      break;

    default:
      messages.push({msg: "Invalid command", className: "jquery-console-invalid-command"});
      this.showAttackPrompt(messages);
      break;
  }
  return messages;
};
GameState.prototype.roundhouseAttack = function(messages) {
  var numAttacks = this.player.getRoundhouseAttacks();
  for (var i = 0; i < numAttacks && !this.monstersAllDead(); i++) {
    messages.push({msg: this.monsters[this.randomMonster()].hit(1)});
  }

  this.playerAction = null;
  this.endAttack(messages);
};
GameState.prototype.randomMonster = function() {
  var index = null;
  do {
    index = randomInteger(this.monsters.length) - 1;
  } while (this.monsters[index].isDead());
  return index;
}
GameState.prototype.monstersAllDead = function() {
  for (var i = 0; i < this.monsters.length; i++) {
    if (!this.monsters[i].isDead())
      return false;
  }
  return true;
};
GameState.prototype.endAttack = function(messages) {
  if (!this.checkWonGame(messages)) {
    this.checkRoundEnd(messages);
  }
};
GameState.prototype.checkWonGame = function(messages) {
  if (this.monstersAllDead()) {
    messages.push({msg: "Congratulations! You have vanquished all your foes."});
    this.nextCommandHandler = this.newGameHandler;
    return true;
  }
  return false;
};
GameState.prototype.checkRoundEnd = function(messages) {
  if (this.attacksRemaining == 0) {
    messages.push({msg: "Implement monster attacks!", className: "jquery-console-invalid-command"});
  }
  this.showMonsters(messages);
  this.showAttackPrompt(messages);
};



function MonsterBattle(place) {
  // jQuery Console
  this.console = $('<div class="console">');
  place.append(this.console);

  this.controller = this.console.console({
    promptLabel: '> ',
    //commandValidate: method(this, "commandValidate"),
    commandHandle: method(this, "commandHandle"),
    autofocus: true,
    animateScroll: true,
    promptHistory: true,
    welcomeMessage: 'Welcome to Monster Battle! Press <enter> to begin.'
    //charInsertTrigger: function(keycode,line) {}
  });

  // Game state
  this.gameState = new GameState();
}
MonsterBattle.prototype.commandHandle = function(line) {
  return this.gameState.nextCommandHandler(line);
};


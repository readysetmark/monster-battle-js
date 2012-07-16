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
  if (this.isDead())
    return "You killed the " + this.monsterType + "!";
  else
    return "You hit the " + this.monsterType + ", knocking off " + damage
      + " health points!";
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
Player.prototype.attackOptions = function() {
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
  this.gameState = null;
}
// MonsterBattle.prototype.commandValidate = function(line) {
//   if (this.gameState == null) {
//     return true;
//   }
//   else {

//   }
//   if (line == "") return false;
//   else return true;
// };
MonsterBattle.prototype.commandHandle = function(line) {
  var messages = [];
  if (this.gameState == null) {
    this.newGame();
    this.showMonsters(messages);
  }
  else if (this.gameState.player.attacks[line] == null) {
    messages.push({msg: "Invalid command", className: "jquery-console-invalid-command"});
  }
  this.showPrompt(messages);
  return messages;
};
MonsterBattle.prototype.newGame = function() {
  this.gameState = {
    player: new Player(),
    monsters: [new OrcMonster()]
  };
};
MonsterBattle.prototype.showMonsters = function(messages) {
  messages.push({msg: "You are faced with these foes:"});
  for(var i = 0; i < this.gameState.monsters.length; i++) {
    messages.push({msg: (i+1) + ". " + this.gameState.monsters[i].show()});
  }
}
MonsterBattle.prototype.showPrompt = function(messages) {
  messages.push({msg: this.gameState.player.show(), className: "jquery-console-player-status"});
  messages.push({msg: this.gameState.player.attackOptions(), className: "jquery-console-options"});
};
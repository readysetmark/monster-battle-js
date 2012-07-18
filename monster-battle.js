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
  return "A fierce " + this.monsterType.toLowerCase();
}
Monster.prototype.hit = function(damage) {
  this.health -= damage;
  var msg = "You hit the " + this.monsterType.toLowerCase() + ", knocking off " + damage
      + " health points!";
  if (this.isDead())
    msg +=  " The " + this.monsterType.toLowerCase() + " has been slain!";
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
  return [{message: msg, healthDamage: dmg}];
};

function HydraMonster() {
  Monster.call(this, "Hydra");
}
HydraMonster.prototype = clone(Monster.prototype);
HydraMonster.prototype.constructor = HydraMonster;
HydraMonster.prototype.description = function() {
  return "A malicious hydra with " + this.health + " heads";
};
HydraMonster.prototype.hit = function(damage) {
  this.health -= damage;
  if (this.isDead()) {
    return "The corpse of the fully decapitated and decapacitated hydra falls to the floor!";
  }
  return "You lop off " + damage + " of the hydra's heads!";
};
HydraMonster.prototype.attack = function() {
  var dmg = randomInteger(Math.ceil(this.health / 2));
  var msg = "A hydra attacks you with " + dmg + " of its heads! It also grows back one more head!";
  this.health += 1;
  return [{message: msg, healthDamage: dmg}];
};

function SlimeMoldMonster() {
  Monster.call(this, "Slime Mold");
  this.sliminess = randomInteger(5);
}
SlimeMoldMonster.prototype = clone(Monster.prototype);
SlimeMoldMonster.prototype.constructor = SlimeMoldMonster;
SlimeMoldMonster.prototype.description = function() {
  return "A slime mold with a sliminess of " + this.sliminess;
};
SlimeMoldMonster.prototype.attack = function() {
  var attacks = [];
  var dmg = randomInteger(this.sliminess);
  var msg = "A slime mold wraps around your legs and decreases your agility by " + dmg + ".";
  attacks.push({message: msg, agilityDamage: dmg})
  if (randomInteger(2) == 2) {
    attacks.push({message: "It also squirts in your face, taking away a health point!", healthDamage: 1});
  }
  return attacks;
};

function BrigandMonster() {
  Monster.call(this, "Brigand");
}
BrigandMonster.prototype = clone(Monster.prototype);
BrigandMonster.prototype.constructor = BrigandMonster;
BrigandMonster.prototype.attack = function(player) {
  var target = Math.max(Math.max(player.health, player.agility), player.strength);
  if (target == player.health) {
    return [{message: "A brigand hits you with his slingshot, taking off 2 health points!", healthDamage: 2}];
  }
  else if (target == player.agility) {
    return [{message: "A brigand catches your leg with his whip, taking off 2 agility points!", agilityDamage: 2}];
  }
  else {
    return [{message: "A brigand cuts your arm with his whip, taking off 2 strength points!", strengthDamage: 2}];
  }
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
Player.prototype.hit = function(attack) {
  if (typeof(attack["healthDamage"]) == "number") {
    this.health -= attack["healthDamage"];
  }
  if (typeof(attack["agilityDamage"]) == "number") {
    this.agility -= attack["agilityDamage"];
  }
  if (typeof(attack["strengthDamage"]) == "number") {
    this.strength -= attack["strengthDamage"];
  }
};
Player.prototype.getNumberOfAttacksForRound = function() {
  return 1 + Math.floor(Math.max(0, this.agility) / 15);
};
Player.prototype.getRoundhouseAttacks = function() {
  return 1 + randomInteger(Math.floor(this.strength / 3));
};
Player.prototype.getRoundhouseDamage = function() {
  return 1;
};
Player.prototype.getStabDamage = function() {
  return 2 + randomInteger(Math.floor(this.strength / 2));
};
Player.prototype.getDoubleSwingDamage = function() {
  return randomInteger(Math.ceil(this.strength / 6));
};
Player.prototype.getAttackOptions = function() {
  var attacks = "Select attack style: ";
  for(var attack in this.attacks) {
    attacks = attacks + " " + this.attacks[attack];
  }
  return attacks;
};
Player.prototype.show = function() {
  return "You are a defiant gladiator with a health of " + this.health
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
  var messages = [];
  this.player = new Player();
  this.playerAction = null;
  this.attacksRemaining = null;
  this.generateMonsters(12);
  this.startRound(messages)
  return messages;
};
GameState.prototype.generateMonsters = function(num) {
  var monsterConstructors = [OrcMonster, HydraMonster, SlimeMoldMonster, BrigandMonster];
  this.monsters = [];
  for (var i = 0; i < num; i++) {
    this.monsters.push(new monsterConstructors[randomInteger(monsterConstructors.length)-1]());
  }
}
GameState.prototype.startRound = function(messages) {
  this.attacksRemaining = this.player.getNumberOfAttacksForRound();
  this.showMonsters(messages);
  this.showAttackPrompt(messages);
};
GameState.prototype.showMonsters = function(messages) {
  messages.push({msg: "You are faced with these foes:"});
  for (var i = 0; i < this.monsters.length; i++) {
    messages.push({msg: (i+1) + ". " + this.monsters[i].show()});
  }
};
GameState.prototype.showAttackPrompt = function(messages) {
  messages.push({msg: this.player.show(), className: "jquery-console-player-status"});
  messages.push({msg: "You have " + this.attacksRemaining + " attacks left this round.", className: "jquery-console-prompt"});
  messages.push({msg: this.player.getAttackOptions(), className: "jquery-console-prompt"});
  this.nextCommandHandler = this.attackHandler;
};
GameState.prototype.attackHandler = function(line) {
  var messages = [];
  switch(line) {
    case "s":
      this.attacksRemaining -= 1;
      this.playerAction = {action: "stab"};
      this.pickMonster(messages);
      break;

    case "d":
      this.attacksRemaining -= 1;
      this.playerAction = {action: "doubleSwing1", damage: this.player.getDoubleSwingDamage()};
      messages.push({msg: "Your double swing has a strength of " + this.playerAction.damage, className: "jquery-console-prompt"});
      this.pickMonster(messages);
      break;

    case "r":
      this.attacksRemaining -= 1;
      this.roundhouseAttack(messages);
      break;

    default:
      messages.push({msg: "Invalid command", className: "jquery-console-error"});
      this.showAttackPrompt(messages);
      break;
  }
  return messages;
};
GameState.prototype.roundhouseAttack = function(messages) {
  var numAttacks = this.player.getRoundhouseAttacks();
  for (var i = 0; i < numAttacks && !this.monstersAllDead(); i++) {
    messages.push({msg: this.monsters[this.randomMonster()].hit(this.player.getRoundhouseDamage()), className: "jquery-console-attack"});
  }
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
  this.playerAction = null;
  if (!this.checkWonGame(messages)) {
    this.checkRoundEnd(messages);
  }
};
GameState.prototype.checkWonGame = function(messages) {
  if (this.monstersAllDead()) {
    messages.push({msg: "Congratulations! You have vanquished all your foes."});
    messages.push({msg: "Press <enter> to start a new game."});
    this.nextCommandHandler = this.newGameHandler;
    return true;
  }
  return false;
};
GameState.prototype.checkLostGame = function(messages) {
  if (this.player.isDead()) {
    messages.push({msg: "You have been killed. Game over."});
    messages.push({msg: "Press <enter> to start a new game."});
    this.nextCommandHandler = this.newGameHandler;
    return true;
  }
  return false;
}
GameState.prototype.checkRoundEnd = function(messages) {
  if (this.attacksRemaining == 0) {
    this.doMonsterAttackPhase(messages);
    if (!this.checkLostGame(messages)) {
      this.startRound(messages);
    }
  }
  else {
    this.showMonsters(messages);
    this.showAttackPrompt(messages);
  }
};
GameState.prototype.doMonsterAttackPhase = function(messages) {
  for (var i = 0; i < this.monsters.length; i++) {
    if (!this.monsters[i].isDead()) {
      var attacks = this.monsters[i].attack(this.player);
      for (var j = 0; j < attacks.length; j++) {
        messages.push({msg: attacks[j].message, className: "jquery-console-damage"});
        this.player.hit(attacks[j]);
      }
    }
  }
};
GameState.prototype.pickMonster = function(messages) {
  messages.push({msg: "Select monster #", className: "jquery-console-prompt"});
  this.nextCommandHandler = this.pickMonsterHandler;
};
GameState.prototype.pickMonsterHandler = function(line) {
  var messages = [];
  var status = this.parseMonsterNumber(line, messages);
  if (status.valid) {
    switch (this.playerAction.action) {
      case "stab":
        messages.push({msg: this.monsters[status.index].hit(this.player.getStabDamage()), className: "jquery-console-attack"});
        this.endAttack(messages);
        break;

      case "doubleSwing1":
        messages.push({msg: this.monsters[status.index].hit(this.playerAction.damage), className: "jquery-console-attack"});
        if (!this.checkWonGame(messages)) {
          this.playerAction.action = "doubleSwing2";
          this.pickMonster(messages);
        }
        break;

      case "doubleSwing2":
        messages.push({msg: this.monsters[status.index].hit(this.playerAction.damage), className: "jquery-console-attack"});
        this.endAttack(messages);
        break;

      default:
        messages.push({msg: "Weird, how did you get here?", className: "jquery-console-error"});
        break;
    }
  }
  return messages;
};
GameState.prototype.parseMonsterNumber = function(line, messages) {
  var monsterNum = parseInt(line) - 1;
  if (typeof(this.monsters[monsterNum]) != "object") {
    messages.push({msg: "That is not a valid monster number.", className: "jquery-console-error"});
    this.pickMonster(messages);
    return {valid: false};
  }
  if (this.monsters[monsterNum].isDead()) {
    messages.push({msg: "That monster is already dead.", className: "jquery-console-error"});
    this.pickMonster(messages);
    return {valid: false};
  }
  return {valid: true, index: monsterNum};
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


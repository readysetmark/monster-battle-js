function method(object, name) {
  return function() {
    return object[name].apply(object, arguments);
  };
}



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
Player.prototype.status = function() {
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
  }
  else if (this.gameState.player.attacks[line] == null) {
    messages.push({msg: "Invalid command", className: "jquery-console-invalid-command"});
  }
  this.prompt(messages);
  return messages;
};
MonsterBattle.prototype.newGame = function() {
  this.gameState = {
    player: new Player()
  }
};
MonsterBattle.prototype.prompt = function(messages) {
  messages.push({msg: this.gameState.player.status(), className: "jquery-console-player-status"});
  messages.push({msg: this.gameState.player.attackOptions(), className: "jquery-console-options"});
};
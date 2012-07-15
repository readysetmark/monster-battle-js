
function MonsterBattle(place) {
  this.console = $('<div class="console">');
  place.append(this.console);

  this.controller = this.console.console({
    promptLabel: '> ',
    commandValidate: function(line) {
      if (line == "") return false;
      else return true;
    },
    commandHandle: function(line) {
      return [{msg: "Not implemented yet.",
               className: "not-implemented"}]
    },
    autofocus: true,
    animateScroll: true,
    promptHistory: true,
    //charInsertTrigger: function(keycode,line) {}
  });
}


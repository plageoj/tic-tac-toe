window.alert = function (msg) {
  ons.notification.alert({ message: JSON.stringify(msg), title: "Debug" });
};

angular
  .module("tictactoe", ["onsen", "tictactoelang"])
  .service("Ttt", function ($timeout) {
    var who = [],
      waiting;
    var current = 0,
      onwin;

    var msgSet = () => {
      return who[current / 2] + waiting;
    };

    this.what = ["fa-times", "", "fa-circle-o"];

    this.init = (langObj, com) => {
      current = 0;
      this.table = [];
      for (var i = 0; i < 3; i++) {
        this.table.push([
          { count: 0, text: 1 },
          { count: 0, text: 1 },
          { count: 0, text: 1 },
        ]);
      }

      who = com ? langObj.computer : langObj.players;
      waiting = langObj.phase;
      this.msg = msgSet();

      this.vsComputer = com;
    };

    this.onWin = function (func) {
      onwin = func;
    };

    this.setPlayersName = function (a) {
      angular.copy(a, who);
    };

    this.getPlayersName = function () {
      return who;
    };

    this.getCurrentPlayer = function () {
      return current / 2;
    };

    var erase = () => {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          if (this.table[i][j].count) {
            this.table[i][j].count--;
          } else {
            this.table[i][j].text = 1;
          }
        }
      }
    };

    var test = () => {
      var ret = [0, 0, 0, 0, 0, 0, 0, 0];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          ret[i] += this.table[i][j].text - 1;
          ret[3 + i] += this.table[j][i].text - 1;
          if (i == j) {
            ret[6] += this.table[i][j].text - 1;
          }
          if (i == 2 - j) {
            ret[7] += this.table[i][j].text - 1;
          }
        }
      }
      return ret;
    };

    var think = (test) => {
      var lose = [],
        win = [],
        ret = parseInt(Math.random() * 9),
        t;

      while (this.table[parseInt(ret / 3)][ret % 3].text != 1) {
        ret = parseInt(Math.random() * 9);
      }

      var seek = (arrIndex) => {
        var check = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ],
          mem = [];
        angular.forEach(arrIndex, (v) => {
          var minc, memindex;
          for (var i = (memindex = 0), minc = 6; i < 3; i++) {
            var x = check[v][i];
            var mono = this.table[parseInt(x / 3)][x % 3];
            if (mono.count < minc) {
              minc = mono.count;
            }
            if (mono.text == 1) {
              memindex = x;
            }
          }
          mem.push({ count: minc, index: memindex });
        });
        mem = mem.sort((a, b) => a.count - b.count)[0];
        return mem;
      };

      for (var i = 0; i < 8; i++) {
        var d = test[i];
        if (d == -2) {
          lose.push(i);
        } else if (d == 2) {
          win.push(i);
        }
      }
      if (lose.length) {
        ret = seek(lose).index;
      }
      if (win.length) {
        t = seek(win);
        ret = t.count == 0 ? t.index : ret;
      }
      return ret;
    };

    this.onclick = (index) => {
      if (this.table[parseInt(index / 3)][index % 3].count) {
        return;
      }
      this.table[parseInt(index / 3)][index % 3].text = current;
      this.table[parseInt(index / 3)][index % 3].count = 6;

      erase();
      var t = test();
      if (t.filter((d) => Math.abs(d) == 3).length) {
        onwin();
        return;
      }
      current = 2 - current;
      this.msg = msgSet();
      if (this.vsComputer && current == 2) {
        $timeout(() => {
          this.onclick(think(t));
        }, 600);
      }
    };
  })
  .controller("HomeCtrl", function ($scope, Ttt) {
    $scope.start = (com) => {
      myNavigator.pushPage("man2man.html");
      Ttt.init($scope.tr.game, com);
    };
  })
  .controller("TttCtrl", function ($scope, Ttt) {
    var tr = $scope.tr;
    $scope.utl = Ttt;

    $scope.onclick = (i) => {
      Ttt.onclick(i);
    };

    Ttt.onWin(() => {
      ons.notification.confirm({
        message: tr.game.continuePrompt,
        title: Ttt.getPlayersName()[Ttt.getCurrentPlayer()] + tr.game.wins,
        buttonLabels: tr.game.button,
        callback: (index) => {
          switch (index) {
            case 0:
              Ttt.init(tr.game, Ttt.vsComputer);
              $scope.$apply();
              break;
            case 1:
              myNavigator.popPage();
              break;
          }
        },
      });
    });
  });
